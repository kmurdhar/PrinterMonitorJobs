import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export const useWebSocket = (url: string, onMessage?: (message: WebSocketMessage) => void) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    const connect = () => {
      try {
        ws.current = new WebSocket(url);
        
        ws.current.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
        };
        
        ws.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            setLastMessage(message);
            onMessage?.(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.current.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          // Reconnect after 5 seconds
          setTimeout(connect, 5000);
        };
        
        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url, onMessage]);

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, lastMessage, sendMessage };
};