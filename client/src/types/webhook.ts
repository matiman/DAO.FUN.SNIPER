export interface WebhookPayload {
  method: string;
  headers: Record<string, string>;
  body: any;
  timestamp: string;
  id: string;
}

export interface WebSocketMessage {
  type: 'webhook';
  payload: WebhookPayload;
}
