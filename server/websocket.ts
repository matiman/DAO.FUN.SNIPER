import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { IncomingMessage } from 'http';
import type { WebhookPayload, WebSocketMessage } from '../client/src/types/webhook';
import { log } from './vite';

export class WebhookWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocket>;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      verifyClient: ({ req }: { req: IncomingMessage }) => {
        // Ignore Vite HMR connections
        return req.headers['sec-websocket-protocol'] !== 'vite-hmr';
      }
    });
    this.clients = new Set();

    this.wss.on('connection', (ws) => {
      log('WebSocket client connected');
      this.clients.add(ws);

      ws.on('close', () => {
        log('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      // Send a ping every 30 seconds to keep the connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      }, 30000);

      ws.on('close', () => {
        clearInterval(pingInterval);
      });
    });
  }

  broadcast(payload: WebhookPayload) {
    const message: WebSocketMessage = {
      type: 'webhook',
      payload
    };

    log(`Broadcasting webhook to ${this.clients.size} clients`);

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        log('Webhook sent to client');
      }
    });
  }
}