"use client";

import React, { useState, useEffect } from "react";
import { X, Bell, AlertTriangle, Send, ShieldAlert, Users } from "lucide-react";
import { AdminTrip } from "@/services/admin";

interface SendNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    trip: AdminTrip | null;
    onSend: (payload: { type: string, message: string, broadcastToMembers: boolean }) => void;
}

const TEMPLATES = [
    {
        id: "POLICY",
        label: "Vi phạm tiêu chuẩn cộng đồng",
        content: "Hệ thống phát hiện chuyến đi [TRIP_NAME] chứa nội dung chưa phù hợp. Vui lòng cập nhật lại hình ảnh/mô tả trong vòng 24h trước khi chuyến đi bị tạm khóa.",
        broadcast: false,
    },
    {
        id: "INACTIVE",
        label: "Bỏ bê chuyến đi / Không duyệt thành viên",
        content: "Chuyến đi [TRIP_NAME] đang có thành viên chờ duyệt hoặc sắp đến hạn khởi hành. Bạn hãy truy cập vào hệ thống để xử lý các yêu cầu nhé.",
        broadcast: false,
    },
    {
        id: "SCAM_WARNING",
        label: "Cảnh báo rủi ro / Dấu hiệu lừa đảo (Gửi cho tất cả)",
        content: "Cảnh báo Hệ thống: Chuyến đi [TRIP_NAME] có dấu hiệu rủi ro hoặc chưa minh bạch chi phí. Tuyệt đối KHÔNG chuyển tiền cọc trước khi xác minh rõ ràng.",
        broadcast: true,
    },
    {
        id: "LOW_FILL",
        label: "Nhắc nhở tỉ lệ tham gia thấp",
        content: "Chuyến đi [TRIP_NAME] sắp khởi hành nhưng tỉ lệ tham gia còn thấp. Bạn có thể chia sẻ lên các nhóm cộng đồng để tìm thêm bạn đồng hành nhé!",
        broadcast: false,
    },
    {
        id: "CUSTOM",
        label: "Tùy chỉnh (Nhập tay)",
        content: "",
        broadcast: false,
    }
];

export default function SendNotificationModal({ isOpen, onClose, trip, onSend }: SendNotificationModalProps) {
    const [selectedType, setSelectedType] = useState(TEMPLATES[0].id);
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    // Khi đổi mẫu hoặc đổi chuyến đi, tự động điền nội dung
    useEffect(() => {
        if (!trip) return;
        const template = TEMPLATES.find(t => t.id === selectedType);
        if (template && selectedType !== "CUSTOM") {
            setMessage(template.content.replace("[TRIP_NAME]", `"${trip.destination}"`));
        } else if (selectedType === "CUSTOM") {
            setMessage("");
        }
    }, [selectedType, trip]);

    if (!isOpen || !trip) return null;

    const currentTemplate = TEMPLATES.find(t => t.id === selectedType);
    const memberCount = trip.members?.length || 0;

    const handleSend = async () => {
        if (!message.trim()) return alert("Vui lòng nhập nội dung thông báo!");
        setIsSending(true);
        try {
            // Trả data ra ngoài để hàm handle gọi API
            await onSend({
                type: selectedType,
                message: message,
                broadcastToMembers: currentTemplate?.broadcast || false
            });
            onClose();
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-orange-500" /> Gửi Thông báo
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Chuyến đi: <span className="font-bold text-slate-700">{trip.destination}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-white p-1.5 rounded-full shadow-sm transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Chọn kịch bản */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Chủ đề (Kịch bản):</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm font-medium text-slate-700"
                        >
                            {TEMPLATES.map(t => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Khung cảnh báo màu đỏ nếu là dạng Broadcast */}
                    {currentTemplate?.broadcast && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-rose-800">Chế độ Broadcast đang bật!</p>
                                <p className="text-xs text-rose-600 mt-1">Thông báo này sẽ được gửi trực tiếp đến <strong>Leader</strong> và <strong>{memberCount} thành viên</strong> đang tham gia/chờ duyệt để cảnh báo rủi ro.</p>
                            </div>
                        </div>
                    )}

                    {/* Nội dung tin nhắn */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Nội dung chi tiết (Có thể chỉnh sửa):</label>
                        <textarea
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Nhập nội dung thông báo..."
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm resize-none"
                        ></textarea>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isSending || !message.trim()}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-md
                            ${currentTemplate?.broadcast ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        {isSending ? <AlertTriangle className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
                        {currentTemplate?.broadcast ? 'Gửi Cảnh báo Hàng loạt' : 'Gửi Thông báo'}
                    </button>
                </div>
            </div>
        </div>
    );
}