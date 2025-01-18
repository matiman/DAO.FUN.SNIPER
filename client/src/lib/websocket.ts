import { useEffect, useState } from 'react';
import type { WebSocketMessage } from '@/types/webhook';
import { useToast } from '@/hooks/use-toast';

// Determine WebSocket protocol based on page protocol
const WS_PROTOCOL = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_URL = `${WS_PROTOCOL}//${window.location.host}`;

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      toast({
        title: 'Connected',
        description: 'WebSocket connection established'
      });
    };

    ws.onmessage = (event) => {
      console.log('Received message:', event.data);
      const message = JSON.parse(event.data) as WebSocketMessage;
      setMessages((prev) => [message, ...prev]); // Prepend new messages
      // Notify about new webhook
      toast({
        title: 'New Webhook',
        description: `Received ${message.payload.method} request`,
        variant: 'default'
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to WebSocket server',
        variant: 'destructive'
      });
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected, attempting to reconnect...');
      setConnected(false);
      setTimeout(() => {
        setSocket(new WebSocket(WS_URL));
      }, 1000);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [toast]);

  return { messages, connected };
}