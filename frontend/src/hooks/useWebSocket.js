import { useState, useEffect, useCallback } from 'react';

const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('humantic_token');
    if (!token) return;

    const wsUrl = `${url}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (error) {
        console.error('WebSocket message parse error', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error', error);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
      // Optional: reconnect logic
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [url]);

  const sendMessage = useCallback((message) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  }, [socket, isConnected]);

  return { lastMessage, isConnected, sendMessage };
};

export default useWebSocket;
