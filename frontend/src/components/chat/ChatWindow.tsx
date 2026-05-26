// src/components/chat/ChatWindow.tsx
"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Smile, Image as ImageIcon, MoreVertical } from "lucide-react";
import ReportUserDialog from "@/components/report/ReportUserDialog";

const CURRENT_USER_ID = "m1";

// MOCK DATA 2: Đã được di dời từ page.tsx sang đây
const MOCK_MESSAGES = [
    { id: "msg1", senderId: "m2", senderName: "Trần Thị Bích", avatar: "TB", content: "Chào mọi người, mình mới tham gia nhóm nha!" },
    { id: "msg2", senderId: "m3", senderName: "Lê Văn Cường", avatar: "LC", content: "Chào Bích, bạn chuẩn bị đồ đạc tới đâu rồi?" },
    { id: "msg3", senderId: "m1", senderName: "Đình Thạch", avatar: "ĐT", content: "Chào mừng Bích! Mọi người update danh sách đồ đi nhé." },
    { id: "msg4", senderId: "m2", senderName: "Trần Thị Bích", avatar: "TB", content: "Mình đang xem, chắc cần mua thêm giày leo núi." },
];

interface ChatWindowProps {
    tripId: string;
}

export default function ChatWindow({ tripId }: ChatWindowProps) {
    const [newMessage, setNewMessage] = useState("");

    // Giả lập lấy tên phòng chat dựa trên tripId
    const roomTitle = tripId === "4" ? "Trekking Tà Năng - Phan Dũng" : "Phòng chat nhóm";

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        // Logic gửi API bằng Fetch Wrapper sẽ nằm ở đây
        alert(`Đã gửi: ${newMessage}`);
        setNewMessage("");
    };

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-64px)] bg-slate-50">
            {/* Header Chat Window */}
            <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-600 text-white font-bold">
                            {roomTitle.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-bold text-slate-800">{roomTitle}</h2>
                        <p className="text-xs text-slate-500">3 thành viên</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5 text-slate-500" />
                </Button>
            </div>

            {/* Lịch sử tin nhắn */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {MOCK_MESSAGES.map((msg) => {
                    const isMe = msg.senderId === CURRENT_USER_ID;

                    return (
                        <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                            {/* Avatar và Nút Báo Cáo */}
                            <div className="relative group flex flex-col items-center">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className={isMe ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-700"}>
                                        {msg.avatar}
                                    </AvatarFallback>
                                </Avatar>

                                {/* UC-09: NÚT BÁO CÁO (Chỉ hiện khi trỏ chuột vào Avatar người khác) */}
                                {!isMe && (
                                    <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <ReportUserDialog targetUserId={msg.senderId} targetUserName={msg.senderName}>
                                            <button className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm hover:bg-red-200">
                                                Báo cáo
                                            </button>
                                        </ReportUserDialog>
                                    </div>
                                )}
                            </div>

                            {/* Nội dung tin nhắn */}
                            <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
                                {!isMe && <span className="text-xs text-slate-500 mb-1 ml-1">{msg.senderName}</span>}
                                <div className={`p-3 rounded-2xl ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"}`}>
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Khung gõ tin nhắn */}
            <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 hidden sm:flex">
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 hidden sm:flex">
                        <ImageIcon className="w-5 h-5" />
                    </Button>
                    <div className="flex-1 relative">
                        <Input
                            placeholder="Nhập tin nhắn..."
                            className="pr-10 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400">
                            <Smile className="w-5 h-5" />
                        </Button>
                    </div>
                    <Button className="rounded-full bg-blue-600 hover:bg-blue-700 h-10 w-10 p-0" onClick={handleSendMessage}>
                        <Send className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}