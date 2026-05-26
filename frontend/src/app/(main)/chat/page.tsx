// src/app/(main)/chat/page.tsx
import React from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { MessageSquare } from "lucide-react";

export default function ChatIndexPage() {
    return (
        <div className="flex w-full bg-white h-[calc(100vh-64px)] overflow-hidden">
            {/* Cột trái: Vẫn hiển thị danh sách phòng chat */}
            {/* Ở màn hình di động, danh sách này sẽ chiếm full màn hình */}
            <div className="w-full md:w-auto">
                <ChatSidebar />
            </div>

            {/* Cột phải: Màn hình chờ (Ẩn trên thiết bị di động, chỉ hiện trên Tablet/PC) */}
            <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50 text-slate-400">
                <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                    <MessageSquare className="w-12 h-12 text-blue-200" />
                </div>
                <h3 className="text-lg font-semibold text-slate-600">Tin nhắn của bạn</h3>
                <p className="text-sm mt-1">Chọn một cuộc hội thoại từ danh sách để bắt đầu trò chuyện.</p>
            </div>
        </div>
    );
}