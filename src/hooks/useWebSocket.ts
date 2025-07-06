import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

const getWebSocketUrl = () => {
  // Always use port 3000 for WebSocket connection
  const currentOrigin = window.location.origin;
  const wsOrigin = currentOrigin.replace(':5173', ':3000');
  
  try {
    const url = new URL(wsOrigin);
    // Convert HTTP protocol to WebSocket protocol
    const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${url.host}`;
  } catch (error) {
    // Fallback
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    return `${protocol}//${host}:3000`;
  }
};
export const useWebSocket = (url: string, onMessage?: (message: WebSocketMessage) => void) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    // Don't try to connect if we're already connected or if we've exceeded max attempts
    if (ws.current?.readyState === WebSocket.OPEN || reconnectAttemptsRef.current >= maxReconnectAttempts) {
      return;
    }

    // Use dynamic WebSocket URL instead of the passed url parameter
    const wsUrl = getWebSocketUrl();

    try {
      console.log(`Attempting WebSocket connection to ${wsUrl} (attempt ${reconnectAttemptsRef.current + 1})`);
      
      // Close existing connection if any
      if (ws.current) {
        ws.current.close();
      }

      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // Reset attempts on successful connection
        clearReconnectTimeout();
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
      
      ws.current.onclose = (event) => {
        console.log(`WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`);
        setIsConnected(false);
        
        // Only attempt to reconnect if it wasn't a manual close (code 1000)
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000); // Exponential backoff, max 30s
          
          console.log(`Scheduling reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          clearReconnectTimeout();
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log('Max reconnection attempts reached. Stopping reconnection attempts.');
        }
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      reconnectAttemptsRef.current++;
      
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        clearReconnectTimeout();
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    }
  }, [url, onMessage, clearReconnectTimeout]);

  useEffect(() => {
    connect();

    return () => {
      clearReconnectTimeout();
      if (ws.current) {
        // Set code 1000 to indicate manual close
        ws.current.close(1000, 'Component unmounting');
      }
    };
  }, [connect, clearReconnectTimeout]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
      return false;
    }
  }, []);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0; // Reset attempts
    clearReconnectTimeout();
    if (ws.current) {
      ws.current.close(1000, 'Manual reconnect');
    }
    setTimeout(connect, 100); // Small delay before reconnecting
  }, [connect, clearReconnectTimeout]);

  return { 
    isConnected, 
    lastMessage, 
    sendMessage, 
    reconnect,
    connectionAttempts: reconnectAttemptsRef.current 
  };
};