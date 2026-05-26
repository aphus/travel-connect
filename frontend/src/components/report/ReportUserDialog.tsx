// src/components/report/ReportUserDialog.tsx
"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Import API đã chuẩn bị sẵn
// import api from "@/services/api";

interface ReportUserDialogProps {
    children: React.ReactNode;
    targetUserId: string;
    targetUserName: string;
}

export default function ReportUserDialog({ children, targetUserId, targetUserName }: ReportUserDialogProps) {
    // Quản lý trạng thái đóng/mở của Dialog và dữ liệu form
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        if (!reason) {
            alert("Vui lòng chọn lý do báo cáo!");
            return;
        }

        setIsSubmitting(true);

        /* ==========================================
           LOGIC KẾT NỐI BACKEND ĐÃ CHUẨN BỊ SẴN
           ========================================== */
        // api.post("/reports", {
        //     reportedUserId: targetUserId,
        //     reason: reason,
        //     details: details
        // }).then(() => {
        //     alert("Báo cáo đã được gửi tới Quản trị viên.");
        //     setIsOpen(false);
        //     setReason("");
        //     setDetails("");
        // }).finally(() => {
        //     setIsSubmitting(false);
        // });

        // Giả lập xử lý UI khi chưa nối Backend
        setTimeout(() => {
            alert(`Đã gửi báo cáo vi phạm đối với ${targetUserName}. Quản trị viên sẽ xem xét sớm nhất!`);
            setIsSubmitting(false);
            setIsOpen(false);
            setReason("");
            setDetails("");
        }, 800);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {/* Thành phần bọc bên ngoài sẽ trở thành nút bấm kích hoạt Pop-up */}
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-red-600">Báo cáo vi phạm</DialogTitle>
                </DialogHeader>

                <div className="space-y-5 mt-2">
                    <div className="p-3 bg-slate-50 border rounded-lg text-sm text-slate-700">
                        Bạn đang báo cáo thành viên: <span className="font-bold text-slate-900">{targetUserName}</span>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold text-slate-800">Lý do báo cáo <span className="text-red-500">*</span></Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="-- Chọn lý do --" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SPAM">Spam, quảng cáo trái phép</SelectItem>
                                <SelectItem value="SCAM">Có dấu hiệu lừa đảo, chiếm đoạt</SelectItem>
                                <SelectItem value="HARASSMENT">Quấy rối, chửi bới, xúc phạm</SelectItem>
                                <SelectItem value="NO_SHOW">Hủy chuyến không báo / Không xuất hiện</SelectItem>
                                <SelectItem value="OTHER">Lý do khác</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold text-slate-800">Mô tả chi tiết (Tùy chọn)</Label>
                        <Textarea
                            placeholder="Cung cấp thêm thông tin để Admin dễ dàng xử lý..."
                            className="resize-none h-24"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                        />
                    </div>

                    <Button
                        className="w-full bg-red-600 hover:bg-red-700 text-white mt-2"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}