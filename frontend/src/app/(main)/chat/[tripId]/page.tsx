"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    Search, Phone, Video, MoreVertical, Paperclip,
    Smile, Mic, Camera, Send
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const CURRENT_USER_ID = "m1";

// MOCK DATA 1: DANH SÁCH CÁC NHÓM CHAT (Các chuyến đi đã tham gia)
const MOCK_CHAT_ROOMS = [
    { id: "4", title: "Trekking Tà Năng - Phan Dũng", lastMessage: "Hẹn mọi người 5h sáng nhé!", timestamp: "Hôm nay, 9:52pm", avatar: "TN" },
    { id: "1", title: "Khám phá Đà Lạt 3N2Đ", lastMessage: "Nhớ mang theo áo ấm nha", timestamp: "Hôm qua, 8:30pm", avatar: "ĐL" },
    { id: "5", title: "Nghỉ dưỡng Cát Bà", lastMessage: "Okay, chốt lịch!", timestamp: "Thứ 2, 10:15am", avatar: "CB" },
];

// MOCK DATA 2: TIN NHẮN TRONG PHÒNG HIỆN TẠI
const MOCK_MESSAGES = [
    { id: "msg1", senderId: "m2", senderName: "Trần Thị Bích", avatar: "TB", content: "Chào mọi người, mình mới tham gia nhóm nha!", timestamp: "8:30pm" },
    { id: "msg2", senderId: "m3", senderName: "Lê Văn Cường", avatar: "LC", content: "Chào Bích, bạn chuẩn bị đồ đạc tới đâu rồi?", timestamp: "8:35pm" },
    { id: "msg3", senderId: "m1", senderName: "Đình Thạch", avatar: "ĐT", content: "Chào mừng Bích! Mọi người update danh sách đồ dùng nha.", timestamp: "9:12pm" },
    { id: "msg4", senderId: "m2", senderName: "Trần Thị Bích", avatar: "TB", content: "Mình đang xem, chắc cần mua thêm giày leo núi.", timestamp: "9:15pm" },
    { id: "msg5", senderId: "m1", senderName: "Đình Thạch", avatar: "ĐT", content: "Tuyệt vời, cuối tuần này đi sắm luôn nhé!", timestamp: "9:20pm" },
];

export default function ChatRoomPage() {
    const params = useParams();
    const router = useRouter();
    const tripId = params.tripId as string;

    // STATE
    const [chatRooms, setChatRooms] = useState(MOCK_CHAT_ROOMS);
    const [currentTripInfo, setCurrentTripInfo] = useState({ title: "Đang tải...", avatar: "..." });
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [newMessage, setNewMessage] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    useEffect(() => { scrollToBottom(); }, [messages]);

    /* ==========================================
       BÀN GIAO CHO THÀNH VIÊN 3 (BẢO)
    ========================================== */
    useEffect(() => {
        // 1. Fetch danh sách phòng chat (Bên trái)
        // fetch('/api/users/me/chat-rooms') ...

        // 2. Fetch lịch sử tin nhắn của tripId hiện tại (Bên phải)
        // fetch(`/api/trips/${tripId}/messages`) ...

        // GIẢ LẬP ĐỒNG BỘ UI
        const room = MOCK_CHAT_ROOMS.find(r => r.id === tripId);
        if (room) setCurrentTripInfo({ title: room.title, avatar: room.avatar });
        else setCurrentTripInfo({ title: "Phòng chat ẩn", avatar: "??" });

        // 3. Socket.io Listener: socket.on("receive_message", ...)
    }, [tripId]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Hiển thị ngay lên UI
        const tempMsg = {
            id: Date.now().toString(), senderId: CURRENT_USER_ID, senderName: "Đình Thạch", avatar: "ĐT",
            content: newMessage, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, tempMsg]);
        setNewMessage("");

        // Bảo sẽ gắn: socket.emit("send_message", { tripId, content }) ở đây
    };

    return (
        // Sử dụng chiều cao giới hạn để thanh cuộn chỉ hoạt động bên trong khu vực tin nhắn
        <div className="flex h-[calc(100vh-4rem)] bg-slate-100 p-4 lg:p-6 gap-6">

            {/* ==========================================
          CỘT TRÁI: DANH SÁCH NHÓM CHAT (SIDEBAR)
      ========================================== */}
            <div className="hidden md:flex flex-col w-80 lg:w-96 shrink-0 gap-6">

                {/* Thanh tìm kiếm */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm nhóm chat..."
                        className="pl-12 h-12 bg-white border-none rounded-2xl shadow-sm text-base focus-visible:ring-blue-500"
                    />
                </div>

                {/* Danh sách Groups */}
                <div className="flex-1 bg-white rounded-3xl p-4 shadow-sm overflow-y-auto">
                    <h2 className="font-extrabold text-slate-800 text-lg mb-4 px-2">Nhóm chuyến đi</h2>

                    <div className="space-y-2">
                        {chatRooms.map((room) => {
                            const isActive = room.id === tripId;
                            return (
                                <div
                                    key={room.id}
                                    onClick={() => router.push(`/chat/${room.id}`)}
                                    className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${isActive ? "bg-blue-50 shadow-sm" : "hover:bg-slate-50"
                                        }`}
                                >
                                    <Avatar className="h-12 w-12 shrink-0">
                                        <AvatarFallback className={`${isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"} font-bold`}>
                                            {room.avatar}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className={`font-bold text-sm truncate ${isActive ? "text-blue-700" : "text-slate-900"}`}>
                                                {room.title}
                                            </h3>
                                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">{room.timestamp.split(',')[0]}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{room.lastMessage}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ==========================================
          CỘT PHẢI: KHUNG CHAT CHÍNH
      ========================================== */}
            <div className="flex-1 bg-white rounded-3xl shadow-sm flex flex-col overflow-hidden relative">

                {/* Chat Header */}
                <div className="h-20 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 bg-white/50 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-11 w-11">
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{currentTripInfo.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-bold text-slate-900 text-lg">{currentTripInfo.title}</h2>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-medium text-slate-500">Online • 6 thành viên</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-blue-600">
                        <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors"><Phone className="h-5 w-5" /></button>
                        <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors"><Video className="h-5 w-5" /></button>
                        <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 transition-colors"><MoreVertical className="h-5 w-5" /></button>
                    </div>
                </div>

                {/* Khung Tin Nhắn */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                    {messages.map((msg) => {
                        const isMe = msg.senderId === CURRENT_USER_ID;
                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
                                {!isMe && (
                                    <Avatar className="h-9 w-9 shrink-0">
                                        <AvatarFallback className="bg-slate-200 text-slate-600 text-xs font-bold">{msg.avatar}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
                                    {/* Bong bóng Chat */}
                                    <div className={`px-5 py-3 shadow-sm text-sm ${isMe
                                            ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                                            : "bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-bl-sm"
                                        }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-1.5 px-1">{isMe ? "" : `${msg.senderName} • `}{msg.timestamp}</span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Khung Nhập Liệu */}
                <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-slate-100 p-2 rounded-full pr-3">
                        <button type="button" className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-600 shrink-0">
                            <Paperclip className="h-5 w-5" />
                        </button>

                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 text-slate-700"
                        />

                        <div className="flex items-center gap-1 shrink-0 mr-2 text-slate-400">
                            <button type="button" className="h-8 w-8 flex items-center justify-center hover:text-slate-600"><Camera className="h-5 w-5" /></button>
                            <button type="button" className="h-8 w-8 flex items-center justify-center hover:text-slate-600"><Smile className="h-5 w-5" /></button>
                        </div>

                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 shrink-0 shadow-md p-0 flex items-center justify-center disabled:opacity-50 disabled:bg-slate-400 transition-colors"
                        >
                            {newMessage.trim() ? <Send className="h-4 w-4 text-white -ml-0.5" /> : <Mic className="h-5 w-5 text-white" />}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}