// src/components/chat/ChatSidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// MOCK DATA 1: Đã được di dời từ page.tsx sang đây
const MOCK_CHAT_ROOMS = [
    { id: "4", title: "Trekking Tà Năng - Phan Dũng", lastMessage: "Hẹn mọi người 5h sáng nhé!", timestamp: "Hôm nay, 9:52pm", avatar: "" },
    { id: "1", title: "Khám phá Đà Lạt 3N2D", lastMessage: "Nhớ mang theo áo ấm nha", timestamp: "Hôm qua, 8:30pm", avatar: "" },
    { id: "5", title: "Nghỉ dưỡng Cát Bà", lastMessage: "Okay, chốt lịch!", timestamp: "Thứ 2, 10:15am", avatar: "" },
];

interface ChatSidebarProps {
    // Nhận ID của chuyến đi hiện tại để làm nổi bật (highlight) nhóm chat đang mở
    activeTripId?: string;
}

export default function ChatSidebar({ activeTripId }: ChatSidebarProps) {
    return (
        <div className="w-full md:w-80 border-r border-slate-200 bg-white h-[calc(100vh-64px)] overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-slate-800">Tin nhắn nhóm</h2>
            </div>

            <div className="divide-y divide-slate-100">
                {MOCK_CHAT_ROOMS.map((room) => {
                    // Kiểm tra xem phòng chat này có đang được chọn hay không
                    const isActive = room.id === activeTripId;

                    return (
                        <Link
                            key={room.id}
                            href={`/chat/${room.id}`}
                            className={`flex items-center gap-3 p-4 transition-colors hover:bg-slate-50 cursor-pointer ${isActive ? "bg-blue-50/50 border-l-4 border-blue-600" : "border-l-4 border-transparent"
                                }`}
                        >
                            <Avatar className="h-12 w-12 flex-shrink-0">
                                <AvatarImage src={room.avatar} />
                                <AvatarFallback className={isActive ? "bg-blue-200 text-blue-700" : "bg-slate-100 text-slate-600"}>
                                    {room.title.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`font-semibold text-sm truncate pr-2 ${isActive ? "text-blue-700" : "text-slate-900"}`}>
                                        {room.title}
                                    </h3>
                                    <span className="text-[10px] text-slate-400 flex-shrink-0">{room.timestamp}</span>
                                </div>
                                <p className="text-xs text-slate-500 truncate">{room.lastMessage}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}