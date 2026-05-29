// src/app/(main)/chat/[tripId]/page.tsx
import React from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";

type ChatRoomPageProps = {
  params: Promise<{
    tripId: string;
  }>;
};

export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const { tripId } = await params;

  return (
    <div className="flex w-full bg-white h-[calc(100vh-64px)] overflow-hidden">
      <div className="hidden md:block">
        <ChatSidebar activeTripId={tripId} />
      </div>

      <ChatWindow tripId={tripId} />
    </div>
  );
}
