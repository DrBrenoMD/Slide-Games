/**
 * Serviço de Mensageria e Sincronização em Tempo Real (ApresentaLive)
 * Arquitetura Multi-camada:
 * 1. WebRTC Peer-to-Peer (PeerJS) -> Sincronização direta entre dispositivos diferentes (celulares, telão, laptops) pela internet (sem necessidade de backend, funciona no GitHub Pages!)
 * 2. BroadcastChannel & Storage Events -> Sincronização instantânea com 0ms de latência entre janelas/abas da mesma máquina (ex: 2ª Tela / Projetor)
 * 3. WebSocket (/ws) -> Fallback local para ambiente Node.js / dev server
 */

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
  type: ActionType;
  roomCode: string;
  senderId: string;
  payload: any;
  timestamp: number;
}

class RealtimeSyncService {
  private channel: BroadcastChannel | null = null;
  private ws: WebSocket | null = null;
  private peer: Peer | null = null;
  private peerConnections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  private listeners: Set<(message: RealtimeMessage) => void> = new Set();
  private currentRoomCode: string = '';
  private currentRole: 'presenter' | 'participant' = 'participant';
  private isConnected: boolean = false;
  private retryTimeout: any = null;
  private peerReconnectTimeout: any = null;
  private isDestroyed: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Configura BroadcastChannel local para mesma máquina / 2ª Tela
      try {
        this.channel = new BroadcastChannel('apresentalive_realtime_channel');
        this.channel.onmessage = (event) => {
          this.handleIncomingMessage(event.data, false);
        };
      } catch (err) {
        console.warn('BroadcastChannel não suportado neste navegador, usando storage events', err);
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

      // 3. Tenta WebSocket local (se houver servidor ativo)
      this.initWebSocket();
    }
  }

  private initWebSocket() {
    if (typeof window === 'undefined') return;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingMessage(data, false);
        } catch {
          // ignore invalid json
        }
      };

      this.ws.onclose = () => {
        clearTimeout(this.retryTimeout);
        this.retryTimeout = setTimeout(() => {
          if (!this.isDestroyed) this.initWebSocket();
        }, 5000);
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch (e) {
      // WebSocket não disponível (normal em páginas estáticas como GitHub Pages)
    }
  }

  /**
   * Inicializa a rede WebRTC / PeerJS para a sala informada
   */
  public initPeerNetwork(roomCode: string, role: 'presenter' | 'participant' = 'participant') {
    if (typeof window === 'undefined') return;
    const cleanRoomCode = roomCode.trim().toUpperCase();
    if (!cleanRoomCode) return;

    this.currentRoomCode = cleanRoomCode;
    this.currentRole = role;

    // Fecha peer anterior se houver
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

    const hostPeerId = `apreslive-v2-room-${cleanRoomCode}`;

    if (role === 'presenter') {
      // O apresentador tenta assumir o ID de host da sala
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

        this.peer.on('open', () => {
          this.isConnected = true;
        });

        this.peer.on('connection', (conn) => {
          this.setupIncomingConnection(conn);
        });

        this.peer.on('error', (err: any) => {
          if (err.type === 'unavailable-id') {
            // Outra aba ou sessão de apresentador já é host; cria como client secundário
            this.initClientPeer(cleanRoomCode, hostPeerId);
          }
        });
      } catch (e) {
        console.warn('Erro ao inicializar Host Peer:', e);
      }
    } else {
      // Participante ou Projetor: cria peer cliente e conecta ao host
      this.initClientPeer(cleanRoomCode, hostPeerId);
    }
  }

  private initClientPeer(cleanRoomCode: string, hostPeerId: string) {
    try {
      const clientPeerId = `apreslive-v2-client-${cleanRoomCode}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
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
        this.isConnected = true;
        this.connectToHost(hostPeerId);
      });

      this.peer.on('connection', (conn) => {
        this.setupIncomingConnection(conn);
      });

      this.peer.on('error', () => {
        // Retry connection after delay
        clearTimeout(this.peerReconnectTimeout);
        this.peerReconnectTimeout = setTimeout(() => {
          if (!this.isDestroyed && this.currentRoomCode) {
            this.connectToHost(hostPeerId);
          }
        }, 3000);
      });
    } catch (e) {
      console.warn('Erro ao inicializar Client Peer:', e);
    }
  }

  private connectToHost(hostPeerId: string) {
    if (!this.peer || this.peer.destroyed) return;
    try {
      const conn = this.peer.connect(hostPeerId, { reliable: true });
      this.hostConnection = conn;

      conn.on('open', () => {
        // Solicita estado completo ao conectar
        const reqMsg: RealtimeMessage = {
          type: 'REQUEST_FULL_STATE',
          roomCode: this.currentRoomCode,
          senderId: this.peer?.id || 'client',
          payload: {},
          timestamp: Date.now()
        };
        conn.send(JSON.stringify(reqMsg));
      });

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
        // Tenta reconectar ao host se a sala ainda estiver ativa
        clearTimeout(this.peerReconnectTimeout);
        this.peerReconnectTimeout = setTimeout(() => {
          if (!this.isDestroyed && this.currentRoomCode) {
            this.connectToHost(hostPeerId);
          }
        }, 3000);
      });

      conn.on('error', () => {
        this.hostConnection = null;
      });
    } catch (e) {
      console.warn('Erro ao conectar ao host peer:', e);
    }
  }

  private setupIncomingConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.peerConnections.set(conn.peer, conn);
    });

    conn.on('data', (data: any) => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        this.handleIncomingMessage(parsed, true); // Relays to other peers if presenter
      } catch {
        // ignore
      }
    });

    conn.on('close', () => {
      this.peerConnections.delete(conn.peer);
    });

    conn.on('error', () => {
      this.peerConnections.delete(conn.peer);
    });
  }

  private handleIncomingMessage(msg: RealtimeMessage, shouldRelayToPeers: boolean = false) {
    if (!msg || !msg.roomCode) return;
    // Se estivermos escutando uma sala e a mensagem for de outra sala, ignora
    if (this.currentRoomCode && msg.roomCode !== this.currentRoomCode) return;

    // Notifica ouvintes locais
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (err) {
        console.error('Error in realtime listener:', err);
      }
    });

    // Se somos o apresentador/host e recebemos de um cliente, retransmitimos para os outros clientes
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

  public setRoomCode(code: string, role: 'presenter' | 'participant' = 'participant') {
    const clean = code.trim().toUpperCase();
    if (this.currentRoomCode !== clean || this.currentRole !== role) {
      this.currentRoomCode = clean;
      this.currentRole = role;
      this.initPeerNetwork(clean, role);
    }
  }

  public broadcast(type: ActionType, roomCode: string, senderId: string, payload: any) {
    const cleanRoomCode = roomCode.trim().toUpperCase();
    const message: RealtimeMessage = {
      type,
      roomCode: cleanRoomCode,
      senderId,
      payload,
      timestamp: Date.now()
    };
    const raw = JSON.stringify(message);

    // 1. BroadcastChannel (mesmo navegador/máquina, ex: 2ª Tela)
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (e) {
        // ignore
      }
    }

    // 2. Storage event backup
    try {
      localStorage.setItem('apresentalive_last_msg', raw);
    } catch {
      // ignore
    }

    // 3. WebRTC PeerJS (dispositivos móveis, celulares, computadores remotos)
    if (this.hostConnection && this.hostConnection.open) {
      // Se for cliente conectado ao host
      try {
        this.hostConnection.send(raw);
      } catch {
        // ignore
      }
    } else {
      // Se for host com múltiplos clientes conectados
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

    // 4. WebSocket (se disponível)
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(raw);
      } catch {
        // ignore
      }
    }

    // 5. Notifica ouvintes da própria aba
    this.handleIncomingMessage(message, false);
  }

  public subscribe(listener: (message: RealtimeMessage) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public destroy() {
    this.isDestroyed = true;
    clearTimeout(this.retryTimeout);
    clearTimeout(this.peerReconnectTimeout);
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
