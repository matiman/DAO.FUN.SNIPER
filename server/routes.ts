import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebhookWebSocketServer } from "./websocket";
import crypto from 'crypto';

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  const wss = new WebhookWebSocketServer(httpServer);

  app.post('/api/webhook', (req, res) => {
    const webhookPayload = {
      id: crypto.randomUUID(),
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: req.body,
      timestamp: new Date().toISOString()
    };

    wss.broadcast(webhookPayload);
    res.status(200).json({ message: 'Webhook received successfully' });
  });

  app.get('/api/webhook', (_req, res) => {
    res.status(405).json({ message: 'Method not allowed. Use POST to send webhooks.' });
  });

  return httpServer;
}
