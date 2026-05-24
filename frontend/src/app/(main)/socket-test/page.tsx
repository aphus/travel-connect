"use client";

import { useSocket } from "@/contexts/SocketProvider";
import { useState } from "react";

type PingResponse = {
  success: boolean;
  message: string;
  received: {
    message: string;
  };
  socketId: string;
  timestamp: string;
};

export default function SocketTestPage() {
  const { socket, isConnected } = useSocket();
  const [response, setResponse] = useState("");

  const handlePing = () => {
    if (!socket) {
      setResponse("Socket is not initialized");
      return;
    }

    if (!isConnected) {
      setResponse("Socket is disconnected");
      return;
    }

    socket.emit(
      "ping",
      { message: "Hello from Next.js client" },
      (res: PingResponse) => {
        setResponse(JSON.stringify(res, null, 2));
      },
    );
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Socket Test</h1>

      <p className="mt-4">
        Status: {isConnected ? "Connected" : "Disconnected"}
      </p>

      <button
        onClick={handlePing}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        Send Ping
      </button>

      <pre className="mt-4 rounded bg-gray-100 p-4">{response}</pre>
    </main>
  );
}
