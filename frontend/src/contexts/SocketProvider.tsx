"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/services/fetchWrapper";

type SocketContextValue = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const nextSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000",
      {
        autoConnect: false,
        auth: {
          token: getAccessToken(),
        },
      },
    );

    setSocket(nextSocket);
    nextSocket.connect();

    nextSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected:", nextSocket.id);
    });

    nextSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    const updateSocketAuth = () => {
      nextSocket.auth = { token: getAccessToken() };
      if (nextSocket.connected) nextSocket.disconnect().connect();
    };

    window.addEventListener("auth-token-changed", updateSocketAuth);

    return () => {
      window.removeEventListener("auth-token-changed", updateSocketAuth);
      nextSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
