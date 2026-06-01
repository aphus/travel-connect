"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { fetchWrapper } from "@/services/fetchWrapper";

interface ReportUserDialogProps {
    children: React.ReactNode;
    targetUserId: string;
    targetUserName: string;
    tripId: string;
}

export default function ReportUserDialog({ children, targetUserId, targetUserName, tripId }: ReportUserDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason) {
            alert("Vui lòng chọn lý do báo cáo!");
            return;
        }

        setIsSubmitting(true);

        try {
            await fetchWrapper("/reports", {
                method: "POST",
                body: JSON.stringify({
                    trip_id: tripId,
                    reported_user_id: targetUserId,
                    reason: reason,
                    description: details
                })
            });

            alert(`Đã gửi báo cáo vi phạm đối với ${targetUserName}. Quản trị viên sẽ xem xét sớm nhất!`);
            setIsOpen(false);
            setReason("");
            setDetails("");
        } catch (error) {
            console.error("Lỗi khi gửi báo cáo:", error);
            alert("Gửi báo cáo thất bại, vui lòng thử lại sau!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-rose-600">Báo cáo vi phạm</DialogTitle>
                </DialogHeader>

                <div className="space-y-5 mt-2">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700">
                        Bạn đang báo cáo thành viên: <span className="font-bold text-slate-900">{targetUserName}</span>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold text-slate-800">Lý do báo cáo <span className="text-rose-500">*</span></Label>
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
                            className="resize-none h-24 focus-visible:ring-rose-500"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                        />
                    </div>

                    <Button
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white mt-2 font-bold"
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