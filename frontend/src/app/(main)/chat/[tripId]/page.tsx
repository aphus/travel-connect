// src/app/(main)/chat/[tripId]/page.tsx
import React from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatRoomPage({ params }: { params: { tripId: string } }) {
    // Trích xuất tripId từ đường dẫn URL (ví dụ: /chat/4 -> tripId = "4")
    const { tripId } = params;

    return (
        <div className="flex w-full bg-white h-[calc(100vh-64px)] overflow-hidden">
            {/* Cột trái: Danh sách phòng chat (Ẩn trên màn hình điện thoại nhỏ để tối ưu không gian) */}
            <div className="hidden md:block">
                <ChatSidebar activeTripId={tripId} />
            </div>

            {/* Cột phải: Khung chat chính */}
            <ChatWindow tripId={tripId} />
        </div>
    );
}