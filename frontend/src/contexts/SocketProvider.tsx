"use client";

/* eslint-disable react-hooks/immutability -- Socket.io clients are mutable external objects. */

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

const AUTH_TOKEN_CHANGED_EVENT = "auth-token-changed";

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nextSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000",
      {
        autoConnect: false,
        transports: ["websocket", "polling"],
      },
    );

    setSocket(nextSocket);

    const handleConnect = () => {
      setIsConnected(true);
      console.log("Socket connected:", nextSocket.id);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    };

    const handleConnectError = (error: Error) => {
      setIsConnected(false);
      console.error("Socket connect error:", error.message);
    };

    const handleChatError = (payload: { message?: string }) => {
      console.error("Chat error:", payload?.message);
    };

    const connectWithToken = () => {
      const token = getAccessToken();

      if (!token) {
        if (nextSocket.connected) {
          nextSocket.disconnect();
        }

        setIsConnected(false);
        return;
      }

      nextSocket.auth = { token };

      if (nextSocket.connected) {
        nextSocket.disconnect().connect();
        return;
      }

      nextSocket.connect();
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === "access_token" ||
        event.key === "accessToken" ||
        event.key === "token" ||
        event.key === "auth_user"
      ) {
        connectWithToken();
      }
    };

    nextSocket.on("connect", handleConnect);
    nextSocket.on("disconnect", handleDisconnect);
    nextSocket.on("connect_error", handleConnectError);
    nextSocket.on("chat:error", handleChatError);

    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, connectWithToken);
    window.addEventListener("storage", handleStorage);

    connectWithToken();

    return () => {
      nextSocket.off("connect", handleConnect);
      nextSocket.off("disconnect", handleDisconnect);
      nextSocket.off("connect_error", handleConnectError);
      nextSocket.off("chat:error", handleChatError);

      window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, connectWithToken);
      window.removeEventListener("storage", handleStorage);

      nextSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
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
