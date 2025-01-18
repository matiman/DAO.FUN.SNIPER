import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { IncomingMessage } from 'http';
import type { WebhookPayload, WebSocketMessage } from '../client/src/types/webhook';
import { log } from './vite';

export class WebhookWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocket>;
  private recentMessages: WebhookPayload[] = [];
  private readonly MAX_HISTORY = 50;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      verifyClient: ({ req }: { req: IncomingMessage }) => {
        // Ignore Vite HMR connections
        return req.headers['sec-websocket-protocol'] !== 'vite-hmr';
      }
    });
    this.clients = new Set();

    this.wss.on('connection', (ws, req) => {
      log(`WebSocket client connected from ${req.socket.remoteAddress}`);
      this.clients.add(ws);

      // Send recent message history to new clients
      if (this.recentMessages.length > 0) {
        this.recentMessages.forEach(payload => {
          ws.send(JSON.stringify({
            type: 'webhook',
            payload
          }));
        });
      }

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
    // Store message in recent history
    this.recentMessages.unshift(payload);
    if (this.recentMessages.length > this.MAX_HISTORY) {
      this.recentMessages.pop();
    }

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