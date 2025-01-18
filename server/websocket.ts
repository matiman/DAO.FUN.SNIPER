import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { IncomingMessage } from 'http';
import type { WebhookPayload, WebSocketMessage } from '../client/src/types/webhook';
import { log } from './vite';
import { db } from '@db';
import { webhookLogs } from '@db/schema';
import { desc } from 'drizzle-orm';

export class WebhookWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocket>;
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

    this.wss.on('connection', async (ws, req) => {
      log(`WebSocket client connected from ${req.socket.remoteAddress}`);
      this.clients.add(ws);

      // Send recent message history to new clients
      try {
        const recentLogs = await db.query.webhookLogs.findMany({
          orderBy: [desc(webhookLogs.timestamp)],
          limit: this.MAX_HISTORY,
        });

        if (recentLogs.length > 0) {
          recentLogs.reverse().forEach(payload => {
            ws.send(JSON.stringify({
              type: 'webhook',
              payload: {
                id: payload.webhookId,
                method: payload.method,
                headers: payload.headers,
                body: payload.body,
                timestamp: payload.timestamp.toISOString()
              }
            }));
          });
        }
      } catch (error) {
        log(`Error fetching webhook history: ${error}`);
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

  async broadcast(payload: WebhookPayload) {
    // Store webhook in database
    try {
      await db.insert(webhookLogs).values({
        webhookId: payload.id,
        method: payload.method,
        headers: payload.headers,
        body: payload.body,
        timestamp: new Date(payload.timestamp)
      });
    } catch (error) {
      log(`Error storing webhook: ${error}`);
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