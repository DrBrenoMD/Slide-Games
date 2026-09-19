/**
 * Serviço de Mensageria e Sincronização em Tempo Real (ApresentaLive)
 * Arquitetura Multi-camada de Alta Confiabilidade:
 * 1. MQTT Cloud over Secure WebSockets (HiveMQ / EMQX) -> Funciona globalmente em qualquer dispositivo (4G/5G, Wi-Fi, celulares, tablets, computadores) sem necessidade de backend próprio (100% funcional no GitHub Pages!)
 * 2. WebSocket Local (/ws) -> Conexão direta com servidor Express quando hospedado no Cloud Run / dev server
 * 3. BroadcastChannel & Storage Events -> Sincronização instantânea com 0ms de latência entre janelas/abas da mesma máquina (ex: 2ª Tela / Projetor)
 * 4. Deduplicação inteligente de mensagens para evitar processamento duplicado entre canais
 */

import mqtt, { MqttClient } from 'mqtt';
import Peer, { DataConnection } from 'peerjs';

export type ActionType =
  | 'SYNC_STATE'
  | 'CHANGE_SLIDE'
  | 'TIMER_TICK'
  | 'TIMER_EXPIRED'
  | 'PARTICIPANT_JOIN'
  | 'PARTICIPANT_UPDATE'
  | 'SUBMIT_ANSWER'
  | 'SUBMIT_IMAGE_PIN'
  | 'SUBMIT_TERM'
  | 'SEND_REACTION'
  | 'IMPOSTOR_VOTE'
  | 'REQUEST_FULL_STATE';

export interface RealtimeMessage {
  msgId?: string;
  type: ActionType;
  roomCode: string;
  senderId: string;
  payload: any;
  timestamp: number;
}

class RealtimeSyncService {
  private channel: BroadcastChannel | null = null;
  private ws: WebSocket | null = null;
  private mqttClient: MqttClient | null = null;
  private peer: Peer | null = null;
  private peerConnections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  private listeners: Set<(message: RealtimeMessage) => void> = new Set();
  private currentRoomCode: string = '';
  private currentRole: 'presenter' | 'participant' = 'participant';
  private processedMsgIds: Set<string> = new Set();
  private maxMsgIdCache: number = 200;
  private isDestroyed: boolean = false;
  private wsRetryTimeout: any = null;
  private wsRetryCount: number = 0;
  private maxWsRetries: number = 2;
  private peerReconnectTimeout: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Configura BroadcastChannel para sincronização instantânea na mesma máquina (2ª Tela / Projetor)
      try {
        this.channel = new BroadcastChannel('apresentalive_realtime_channel');
        this.channel.onmessage = (event) => {
          this.handleIncomingMessage(event.data, false);
        };
      } catch (err) {
        console.warn('BroadcastChannel não disponível, usando storage events', err);
      }

      // 2. Storage event backup para mesma máquina
      window.addEventListener('storage', (event) => {
        if (event.key === 'apresentalive_last_msg' && event.newValue) {
          try {
            const data = JSON.parse(event.newValue);
            this.handleIncomingMessage(data, false);
          } catch {
            // ignore
          }
        }
      });

      // 3. Tenta WebSocket local (quando em servidor Node / Express)
      this.initLocalWebSocket();

      // 4. Inicializa cliente MQTT em nuvem (HiveMQ over WSS)
      this.initMqttCloud();
    }
  }

  /**
   * Conecta ao broker MQTT global em nuvem via Secure WebSocket
   * Garante que qualquer celular, tablet ou computador conecte à mesma sala independente da rede
   */
  private initMqttCloud() {
    if (typeof window === 'undefined') return;

    try {
      const clientId = `apreslive_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
      
      // Broker público de alta disponibilidade com suporte a WSS
      const brokerUrl = 'wss://broker.hivemq.com:8884/mqtt';

      this.mqttClient = mqtt.connect(brokerUrl, {
        clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 2500,
        keepalive: 30
      });

      this.mqttClient.on('connect', () => {
        if (this.currentRoomCode) {
          const topic = `apresentalive/room/${this.currentRoomCode}/#`;
          this.mqttClient?.subscribe(topic, { qos: 0 });
        }
      });

      this.mqttClient.on('message', (topic, payload) => {
        try {
          const msgStr = payload.toString();
          const parsed = JSON.parse(msgStr);
          this.handleIncomingMessage(parsed, false);
        } catch (err) {
          // ignore parsing error
        }
      });

      this.mqttClient.on('error', (err) => {
        console.warn('MQTT Connection warning, will retry:', err?.message || err);
      });
    } catch (e) {
      console.warn('Erro ao inicializar MQTT Cloud:', e);
    }
  }

  /**
   * Conecta ao servidor WebSocket local se disponível
   */
  private initLocalWebSocket() {
    if (typeof window === 'undefined') return;
    // Em hosts puramente estáticos/serverless sem servidor customizado, evita spam de websocket
    if (this.wsRetryCount >= this.maxWsRetries) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.wsRetryCount = 0; // Conexão bem-sucedida
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingMessage(data, false);
        } catch {
          // ignore
        }
      };

      this.ws.onclose = () => {
        this.wsRetryCount++;
        clearTimeout(this.wsRetryTimeout);
        if (this.wsRetryCount < this.maxWsRetries) {
          this.wsRetryTimeout = setTimeout(() => {
            if (!this.isDestroyed) this.initLocalWebSocket();
          }, 6000);
        }
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch (e) {
      // Normal em static pages (ex: Vercel, GitHub Pages)
    }
  }

  /**
   * Inicializa WebRTC P2P (PeerJS) como canal complementar
   */
  private initPeerNetwork(cleanRoomCode: string, role: 'presenter' | 'participant') {
    if (typeof window === 'undefined') return;

    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {
        // ignore
      }
      this.peer = null;
    }
    this.peerConnections.clear();
    this.hostConnection = null;

    const hostPeerId = `apreslive-v3-${cleanRoomCode}`;

    if (role === 'presenter') {
      try {
        this.peer = new Peer(hostPeerId, {
          debug: 0,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        this.peer.on('connection', (conn) => {
          conn.on('open', () => {
            this.peerConnections.set(conn.peer, conn);
          });
          conn.on('data', (data: any) => {
            try {
              const parsed = typeof data === 'string' ? JSON.parse(data) : data;
              this.handleIncomingMessage(parsed, true);
            } catch {
              // ignore
            }
          });
          conn.on('close', () => this.peerConnections.delete(conn.peer));
          conn.on('error', () => this.peerConnections.delete(conn.peer));
        });

        this.peer.on('error', (err: any) => {
          if (err.type === 'unavailable-id') {
            this.initClientPeer(cleanRoomCode, hostPeerId);
          }
        });
      } catch {
        // ignore
      }
    } else {
      this.initClientPeer(cleanRoomCode, hostPeerId);
    }
  }

  private initClientPeer(cleanRoomCode: string, hostPeerId: string) {
    try {
      const clientPeerId = `apreslive-v3-c-${cleanRoomCode}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      this.peer = new Peer(clientPeerId, {
        debug: 0,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', () => {
        this.connectToPeerHost(hostPeerId);
      });

      this.peer.on('error', () => {
        clearTimeout(this.peerReconnectTimeout);
        this.peerReconnectTimeout = setTimeout(() => {
          if (!this.isDestroyed && this.currentRoomCode) {
            this.connectToPeerHost(hostPeerId);
          }
        }, 4000);
      });
    } catch {
      // ignore
    }
  }

  private connectToPeerHost(hostPeerId: string) {
    if (!this.peer || this.peer.destroyed) return;
    try {
      const conn = this.peer.connect(hostPeerId, { reliable: true });
      this.hostConnection = conn;

      conn.on('data', (data: any) => {
        try {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          this.handleIncomingMessage(parsed, false);
        } catch {
          // ignore
        }
      });

      conn.on('close', () => {
        this.hostConnection = null;
      });

      conn.on('error', () => {
        this.hostConnection = null;
      });
    } catch {
      // ignore
    }
  }

  /**
   * Processamento e deduplicação de mensagens recebidas de qualquer canal
   */
  private handleIncomingMessage(msg: RealtimeMessage, shouldRelayToPeers: boolean = false) {
    if (!msg || !msg.roomCode) return;

    // Normaliza código da sala
    const cleanRoom = msg.roomCode.trim().toUpperCase();
    if (this.currentRoomCode && cleanRoom !== this.currentRoomCode) return;

    // Deduplicação: se a mensagem já foi processada por outro canal, ignora
    const msgId = msg.msgId || `${msg.senderId}_${msg.type}_${msg.timestamp}`;
    if (this.processedMsgIds.has(msgId)) {
      return;
    }
    this.processedMsgIds.add(msgId);
    if (this.processedMsgIds.size > this.maxMsgIdCache) {
      const first = this.processedMsgIds.values().next().value;
      if (first) this.processedMsgIds.delete(first);
    }

    // Notifica os ouvintes registrados na aplicação
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (err) {
        console.error('Error in realtime listener:', err);
      }
    });

    // Se somos o apresentador e recebemos via WebRTC, retransmite aos outros peers
    if (shouldRelayToPeers && this.currentRole === 'presenter') {
      const raw = JSON.stringify(msg);
      this.peerConnections.forEach((conn) => {
        if (conn.open && conn.peer !== msg.senderId) {
          try {
            conn.send(raw);
          } catch {
            // ignore
          }
        }
      });
    }
  }

  /**
   * Define o código da sala atual e assina o tópico MQTT / canais correspondentes
   */
  public setRoomCode(code: string, role: 'presenter' | 'participant' = 'participant') {
    const clean = code.trim().toUpperCase();
    if (!clean) return;

    if (this.currentRoomCode !== clean || this.currentRole !== role) {
      // Se já estava inscrito em outra sala no MQTT, cancela a inscrição antiga
      if (this.mqttClient && this.mqttClient.connected && this.currentRoomCode) {
        this.mqttClient.unsubscribe(`apresentalive/room/${this.currentRoomCode}/#`);
      }

      this.currentRoomCode = clean;
      this.currentRole = role;

      // Inscreve no novo tópico MQTT
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.subscribe(`apresentalive/room/${clean}/#`, { qos: 0 });
      }

      // Reinicializa WebRTC
      this.initPeerNetwork(clean, role);
    }
  }

  /**
   * Transmite uma mensagem para todos os dispositivos conectados à sala
   * (via MQTT Cloud + WebSocket local + WebRTC + BroadcastChannel)
   */
  public broadcast(type: ActionType, roomCode: string, senderId: string, payload: any) {
    const cleanRoomCode = roomCode.trim().toUpperCase();
    const timestamp = Date.now();
    const msgId = `${senderId}_${type}_${timestamp}_${Math.random().toString(36).substring(2, 6)}`;

    const message: RealtimeMessage = {
      msgId,
      type,
      roomCode: cleanRoomCode,
      senderId,
      payload,
      timestamp
    };

    // Marca como processada localmente para evitar eco
    this.processedMsgIds.add(msgId);
    if (this.processedMsgIds.size > this.maxMsgIdCache) {
      const first = this.processedMsgIds.values().next().value;
      if (first) this.processedMsgIds.delete(first);
    }

    const raw = JSON.stringify(message);

    // 1. MQTT Cloud Relay (conecta celulares, 4G, outras redes, GitHub Pages)
    if (this.mqttClient && this.mqttClient.connected) {
      const topic = `apresentalive/room/${cleanRoomCode}/${type}`;
      this.mqttClient.publish(topic, raw, { qos: 0 });
    }

    // 2. WebSocket Local (servidor Express / Cloud Run)
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(raw);
      } catch {
        // ignore
      }
    }

    // 3. BroadcastChannel (mesmo computador / 2ª Tela / Projetor)
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch {
        // ignore
      }
    }

    // 4. Storage event backup
    try {
      localStorage.setItem('apresentalive_last_msg', raw);
    } catch {
      // ignore
    }

    // 5. WebRTC PeerJS
    if (this.hostConnection && this.hostConnection.open) {
      try {
        this.hostConnection.send(raw);
      } catch {
        // ignore
      }
    } else {
      this.peerConnections.forEach((conn) => {
        if (conn.open) {
          try {
            conn.send(raw);
          } catch {
            // ignore
          }
        }
      });
    }

    // 6. Executa ouvintes da aba local
    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch (err) {
        console.error('Error in realtime listener:', err);
      }
    });
  }

  public subscribe(listener: (message: RealtimeMessage) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public destroy() {
    this.isDestroyed = true;
    clearTimeout(this.wsRetryTimeout);
    clearTimeout(this.peerReconnectTimeout);
    if (this.mqttClient) {
      try {
        this.mqttClient.end(true);
      } catch {
        // ignore
      }
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {
        // ignore
      }
    }
    if (this.channel) {
      try {
        this.channel.close();
      } catch {
        // ignore
      }
    }
  }
}

export const realtimeService = new RealtimeSyncService();
