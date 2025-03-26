import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

type ConnectionStatus = 'Connecting' | 'Connected' | 'Disconnected';

interface WebSocketMessage {
  message_type: 'new_email' | 'email_read' | 'typing_indicator' | 'user_online' | 'user_offline' | 'encryption_status' | 'key_rotation' | 'error';
  sender_id?: string;
  recipient_id?: string;
  payload: any;
  timestamp: string;
}

export const useWebSocket = (url: string) => {
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('Connecting');
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const { user } = useAuth();

  // Function to establish WebSocket connection
  const connect = useCallback(() => {
    // Close any existing connection
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }

    // Clear any pending reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    try {
      setConnectionStatus('Connecting');
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setConnectionStatus('Connected');

        // Send user online message if user is authenticated
        if (user?.id) {
          const userOnlineMessage: WebSocketMessage = {
            message_type: 'user_online',
            sender_id: user.id,
            payload: { username: user.username },
            timestamp: new Date().toISOString()
          };
          ws.send(JSON.stringify(userOnlineMessage));
        }
      };

      ws.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        setLastMessage(event.data);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Disconnected');
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setConnectionStatus('Disconnected');

        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          connect();
        }, 5000); // Reconnect after 5 seconds
      };

      webSocketRef.current = ws;
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      setConnectionStatus('Disconnected');

      // Attempt to reconnect after a delay
      reconnectTimeoutRef.current = window.setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        connect();
      }, 5000); // Reconnect after 5 seconds
    }
  }, [url, user]);

  // Connect to WebSocket when component mounts or URL changes
  useEffect(() => {
    if (url) {
      connect();
    }

    // Cleanup function to close WebSocket connection when component unmounts
    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [url, connect]);

  // Function to send a message through the WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  return {
    lastMessage,
    sendMessage,
    connectionStatus,
    reconnect: connect
  };
};

export default useWebSocket;
