// src/components/chat/ChatWindow.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Send,
  Paperclip,
  Smile,
  Image as ImageIcon,
  MoreVertical,
} from "lucide-react";
import ReportUserDialog from "@/components/report/ReportUserDialog";
import { useSocket } from "@/contexts/SocketProvider";
import api from "@/services/api";
import { getAccessToken } from "@/services/fetchWrapper";
import { getTrip, getTripTitle } from "@/services/trips";
import ChatMenu from "@/components/chat/ChatMenu";


type ApiMessage = {
  id: string;
  trip_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  };
};

type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  avatar: string;
  avatarUrl?: string | null;
  content: string;
  createdAt: string;
};

interface ChatWindowProps {
  tripId: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function mapApiMessage(message: ApiMessage): ChatMessage {
  const senderName = message.sender?.full_name || "Thành viên";

  return {
    id: message.id,
    senderId: message.sender_id,
    senderName,
    avatar: getInitials(senderName) || "TV",
    avatarUrl: message.sender?.avatar_url,
    content: message.content,
    createdAt: message.created_at,
  };
}

function getCurrentUserIdFromToken() {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64)) as { sub?: unknown };

    return typeof decoded.sub === "string" ? decoded.sub : null;
  } catch {
    return null;
  }
}

function isClosedTripStatus(status: string | null) {
  const normalizedStatus = status?.toLowerCase();
  return normalizedStatus === "completed" || normalizedStatus === "cancelled";
}

export default function ChatWindow({ tripId }: ChatWindowProps) {
  const { socket, isConnected } = useSocket();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [tripStatus, setTripStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [trip, setTrip] = useState<any>(null);

  const currentUser = getCurrentUserIdFromToken();
  const isLeader = trip?.leaderId === currentUser || trip?.leader_id === currentUser || trip?.leader?.id === currentUser;

  const rawMembers = trip?.members || trip?.trip_members || [];
  const isMember = isLeader || rawMembers.some((m: any) => {
    const memberId = m.user?.id || m.userId || m.user_id || m.id;
    return memberId === currentUser;
  });

  const roomTitle = trip ? getTripTitle(trip) : "Phòng chat nhóm";
  const isTripClosed = isClosedTripStatus(tripStatus);

  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      if (!tripId) {
        setMessages([]);
        setTripStatus(null);
        setIsLoading(false);
        setError("Không tìm thấy mã chuyến đi.");
        return;
      }

      const token = getAccessToken();

      if (!token) {
        setCurrentUserId(null);
        setMessages([]);
        setTripStatus(null);
        setIsLoading(false);
        setError("Bạn cần đăng nhập để xem tin nhắn.");
        return;
      }

      setCurrentUserId(getCurrentUserIdFromToken());
      setIsLoading(true);
      setError("");

      try {
        const [messagesResponse, tripData] = await Promise.all([
          api.get<ApiMessage[]>(`/trips/${tripId}/messages`),
          getTrip(tripId).catch(() => null),
        ]);

        if (!isMounted) return;

        setMessages(messagesResponse.data.map(mapApiMessage));
        setTrip(tripData);
        setTripStatus(tripData?.status ?? null);
      } catch {
        if (!isMounted) return;

        setError("Không thể tải tin nhắn. Vui lòng thử lại.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [tripId]);

  useEffect(() => {
    if (!socket || !isConnected || !tripId) return;

    const handleNewMessage = (message: ApiMessage) => {
      if (message.trip_id !== tripId) return;

      setMessages((currentMessages) => {
        if (currentMessages.some((item) => item.id === message.id)) {
          return currentMessages;
        }

        return [...currentMessages, mapApiMessage(message)];
      });
    };

    socket.emit("join_trip", { tripId });
    socket.on("message:new", handleNewMessage);

    return () => {
      socket.emit("leave_trip", { tripId });
      socket.off("message:new", handleNewMessage);
    };
  }, [socket, isConnected, tripId]);

  const handleSendMessage = () => {
    const content = newMessage.trim();

    if (!content) return;
    if (isTripClosed) return;

    if (!socket || !isConnected) {
      setError("Mất kết nối realtime. Vui lòng thử lại sau.");
      return;
    }

    socket.emit("send_message", { tripId, content });
    setNewMessage("");
    setError("");
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      {/* Header Chat Window */}
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={trip?.coverUrl || "/images/default-cover.jpg"}
              alt={roomTitle}
              className="object-cover"
            />
            <AvatarFallback className="bg-blue-600 text-white font-bold">
              {roomTitle.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-slate-800">{roomTitle}</h2>
            <p className="text-xs text-slate-500">
              {trip ? `${trip.currentMembers}/${trip.maxMembers} thành viên` : "Đang tải..."}
            </p>
          </div>
        </div>
        <ChatMenu
          tripId={tripId}
          leaderId={trip?.leaderId || trip?.leader_id || ""}
          isLeader={isLeader}
          isMember={isMember}
        />
      </div>

      {/* Lịch sử tin nhắn */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <p className="text-center text-sm text-slate-500">
            Đang tải tin nhắn...
          </p>
        )}

        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        {!isLoading && !error && messages.length === 0 && (
          <p className="text-center text-sm text-slate-500">
            Chưa có tin nhắn nào.
          </p>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar và Nút Báo Cáo */}
              <div className="relative group flex flex-col items-center">
                <Avatar className="h-8 w-8">
                  {msg.avatarUrl && (
                    <AvatarImage src={msg.avatarUrl} alt={msg.senderName} />
                  )}
                  <AvatarFallback
                    className={
                      isMe
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-200 text-slate-700"
                    }
                  >
                    {msg.avatar}
                  </AvatarFallback>
                </Avatar>

                {/* UC-09: NÚT BÁO CÁO (Chỉ hiện khi trỏ chuột vào Avatar người khác) */}
                {!isMe && (
                  <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <ReportUserDialog
                      targetUserId={msg.senderId}
                      targetUserName={msg.senderName}
                    >
                      <button className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm hover:bg-red-200">
                        Báo cáo
                      </button>
                    </ReportUserDialog>
                  </div>
                )}
              </div>

              {/* Nội dung tin nhắn */}
              <div
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}
              >
                {!isMe && (
                  <span className="text-xs text-slate-500 mb-1 ml-1">
                    {msg.senderName}
                  </span>
                )}
                <div
                  className={`p-3 rounded-2xl ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"}`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Khung gõ tin nhắn */}
      {isTripClosed ? (
        <div className="border-t border-slate-200 bg-white p-4">
          <div className="rounded-full bg-slate-100 px-5 py-3 text-center text-sm font-medium text-slate-500">
            Chuyến đi đã kết thúc. Bạn vẫn có thể xem lại tin nhắn nhưng không
            thể gửi tin nhắn mới.
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-600 hidden sm:flex"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-600 hidden sm:flex"
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Nhập tin nhắn..."
                className="pr-10 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400"
              >
                <Smile className="w-5 h-5" />
              </Button>
            </div>
            <Button
              className="rounded-full bg-blue-600 hover:bg-blue-700 h-10 w-10 p-0"
              onClick={handleSendMessage}
            >
              <Send className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
