import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { WebSocketServer } from 'ws';

function websocketPlugin(): Plugin {
  return {
    name: 'apresentalive-websocket-server',
    configureServer(server) {
      if (!server.httpServer) return;

      const wss = new WebSocketServer({ noServer: true });

      server.httpServer.on('upgrade', (request, socket, head) => {
        try {
          const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
          if (url.pathname === '/ws') {
            wss.handleUpgrade(request, socket, head, (ws) => {
              wss.emit('connection', ws, request);
            });
          }
        } catch {
          // ignore malformed upgrade
        }
      });

      wss.on('connection', (ws) => {
        ws.on('message', (data) => {
          const messageStr = data.toString();
          for (const client of wss.clients) {
            if (client !== ws && client.readyState === 1) {
              client.send(messageStr);
            }
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/Slide-Games/',
    plugins: [react(), tailwindcss(), websocketPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
