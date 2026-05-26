"use client";

/* eslint-disable react-hooks/immutability -- Socket.io clients are mutable external objects. */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import {
  AUTH_TOKEN_CHANGED_EVENT,
  AUTH_TOKEN_KEY,
  getAuthToken,
} from "@/services/authToken";

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

  const socket = useMemo(() => {
    if (typeof window === "undefined") return null;

    return io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000", {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      console.log("Socket connected:", socket.id);
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
      const token = getAuthToken();

      if (!token) {
        if (socket.connected) {
          socket.disconnect();
        }

        setIsConnected(false);
        return;
      }

      socket.auth = {
        token,
      };

      if (!socket.connected) {
        socket.connect();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === AUTH_TOKEN_KEY || event.key === "token") {
        connectWithToken();
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("chat:error", handleChatError);
    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, connectWithToken);
    window.addEventListener("storage", handleStorage);

    connectWithToken();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("chat:error", handleChatError);
      window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, connectWithToken);
      window.removeEventListener("storage", handleStorage);
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
