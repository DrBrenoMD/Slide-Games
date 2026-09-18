/**
 * Serviço de Mensageria e Sincronização em Tempo Real (ApresentaLive)
 * Usa WebSocket com fallback instantâneo para BroadcastChannel e LocalStorage.
 */

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
  private listeners: Set<(message: RealtimeMessage) => void> = new Set();
  private currentRoomCode: string = '';
  private isConnected: boolean = false;
  private retryTimeout: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('apresentalive_realtime_channel');
        this.channel.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel não suportado neste navegador, usando storage events', err);
      }

      window.addEventListener('storage', (event) => {
        if (event.key === 'apresentalive_last_msg' && event.newValue) {
          try {
            const data = JSON.parse(event.newValue);
            this.handleIncomingMessage(data);
          } catch {
            // ignore
          }
        }
      });

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
          this.handleIncomingMessage(data);
        } catch {
          // ignore invalid json
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        clearTimeout(this.retryTimeout);
        this.retryTimeout = setTimeout(() => this.initWebSocket(), 3000);
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch (e) {
      console.warn('WebSocket init fallback:', e);
    }
  }

  private handleIncomingMessage(msg: RealtimeMessage) {
    if (!msg || !msg.roomCode) return;
    // Se estivermos escutando uma sala e a mensagem for dela
    if (this.currentRoomCode && msg.roomCode !== this.currentRoomCode) return;

    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (err) {
        console.error('Error in realtime listener:', err);
      }
    });
  }

  public setRoomCode(code: string) {
    this.currentRoomCode = code;
  }

  public broadcast(type: ActionType, roomCode: string, senderId: string, payload: any) {
    const message: RealtimeMessage = {
      type,
      roomCode,
      senderId,
      payload,
      timestamp: Date.now()
    };

    // 1. BroadcastChannel (mesmo browser, abas diferentes)
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // 2. Storage event backup
    try {
      localStorage.setItem('apresentalive_last_msg', JSON.stringify(message));
    } catch {
      // quota or private mode
    }

    // 3. WebSocket (dispositivos externos, celulares etc.)
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (e) {
        console.warn('WebSocket send error:', e);
      }
    }

    // 4. Também notifica ouvintes da própria aba (para consistência do app)
    this.handleIncomingMessage(message);
  }

  public subscribe(listener: (message: RealtimeMessage) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const realtimeService = new RealtimeSyncService();
