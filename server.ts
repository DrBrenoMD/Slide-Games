import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;

interface ClientConnection {
  ws: WebSocket;
  roomCode?: string;
  role?: 'presenter' | 'participant';
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json());

  // In-memory room state cache for fast initial sync
  const roomStateCache = new Map<string, any>();
  const clients = new Set<ClientConnection>();

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), activeRooms: roomStateCache.size });
  });

  // REST API: Get room latest state
  app.get('/api/room/:roomCode', (req, res) => {
    const code = req.params.roomCode.toUpperCase();
    const state = roomStateCache.get(code);
    if (state) {
      res.json({ success: true, state });
    } else {
      res.status(404).json({ success: false, message: 'Room not found' });
    }
  });

  // WebSocket Server for Realtime sync
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    const client: ClientConnection = { ws };
    clients.add(client);

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (!msg || !msg.roomCode) return;

        const cleanCode = msg.roomCode.trim().toUpperCase();
        client.roomCode = cleanCode;

        // If presenter syncs state, cache it
        if (msg.type === 'SYNC_STATE' && msg.payload) {
          roomStateCache.set(cleanCode, {
            ...msg.payload,
            timestamp: Date.now()
          });
        }

        // If a new client requests full state and we have cached state, send it immediately
        if (msg.type === 'REQUEST_FULL_STATE') {
          const cached = roomStateCache.get(cleanCode);
          if (cached && ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'SYNC_STATE',
                roomCode: cleanCode,
                senderId: 'server_cache',
                payload: cached,
                timestamp: Date.now()
              })
            );
          }
        }

        // Broadcast to all clients in the same room (except sender)
        const payloadStr = JSON.stringify(msg);
        clients.forEach((c) => {
          if (c !== client && c.roomCode === cleanCode && c.ws.readyState === WebSocket.OPEN) {
            c.ws.send(payloadStr);
          }
        });
      } catch (err) {
        // ignore malformed message
      }
    });

    ws.on('close', () => {
      clients.delete(client);
    });

    ws.on('error', () => {
      clients.delete(client);
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`ApresentaLive Server running on port ${PORT}`);
  });
}

startServer();
