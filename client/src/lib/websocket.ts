import { useEffect, useState } from 'react';
import type { WebSocketMessage } from '@/types/webhook';

// Determine WebSocket protocol based on page protocol
const WS_PROTOCOL = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_URL = `${WS_PROTOCOL}//${window.location.host}`;

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as WebSocketMessage;
      setMessages((prev) => [...prev, message]);
    };

    ws.onclose = () => {
      setTimeout(() => {
        setSocket(new WebSocket(WS_URL));
      }, 1000);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  return { messages };
}