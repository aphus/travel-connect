"use client";

import React, { useState } from "react";
import { Check, X, Star, Loader2 } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Dữ liệu mẫu (Sẽ được thay thế bằng dữ liệu fetch từ GET API khi load trang)
const DUMMY_REQUESTS = [
    { id: "req_1", name: "Nguyễn Tuấn Anh", trustScore: 4.8, avatar: "TA" },
    { id: "req_2", name: "Trần Thị Bích", trustScore: 3.5, avatar: "TB" },
];

export default function ApprovalSheet({ children }: { children: React.ReactNode }) {
    const [requests, setRequests] = useState(DUMMY_REQUESTS);

    // State để khóa nút bấm của riêng user đang được xử lý, tránh spam click
    const [processingId, setProcessingId] = useState<string | null>(null);

    // HÀM CHUẨN BỊ SẴN CHO BACKEND
    const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
        setProcessingId(id); // Bật loading cho user này

        try {
            /* ==========================================
               PHẦN 1: GỌI API THỰC TẾ (ĐANG COMMENT)
               (Chỉ cần mở ra và sửa URL khi Backend hoàn thiện)
            ========================================== */
            // const response = await fetch(`/api/trips/requests/${id}`, {
            //   method: "POST", // Hoặc PATCH tùy thiết kế API
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify({ action: action }),
            // });

            // if (!response.ok) {
            //   throw new Error("Xử lý thất bại từ server");
            // }

            /* ==========================================
               PHẦN 2: GIẢ LẬP FRONTEND (Sẽ xóa khi dùng API thật)
            ========================================== */
            // Tạo độ trễ 800ms để test hiệu ứng UI khi chờ Backend phản hồi
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Cập nhật giao diện: Xóa người dùng khỏi danh sách chờ sau khi thành công
            setRequests((prev) => prev.filter((req) => req.id !== id));

        } catch (error) {
            console.error("Lỗi khi xử lý yêu cầu:", error);
            // Có thể thêm thư viện Toast (ví dụ: sonner, react-hot-toast) để báo lỗi đỏ ở đây
        } finally {
            setProcessingId(null); // Tắt loading
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>

            <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50">
                <SheetHeader className="mb-6 mt-4">
                    <SheetTitle className="text-xl font-black text-slate-900">Yêu cầu tham gia</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-3">
                    {requests.length === 0 ? (
                        <div className="text-center text-slate-500 py-10 bg-white rounded-2xl border border-slate-100 border-dashed font-medium">
                            Đã xử lý hết tất cả yêu cầu!
                        </div>
                    ) : (
                        requests.map((req) => {
                            // Kiểm tra xem item này có đang bị xử lý không
                            const isProcessing = processingId === req.id;

                            return (
                                <div key={req.id} className="flex items-center justify-between p-3.5 border border-slate-200/60 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all">

                                    <div className="flex items-center gap-3.5">
                                        <Avatar className="h-11 w-11">
                                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{req.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">{req.name}</h4>
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 mt-1">
                                                <Star className="h-3.5 w-3.5 fill-amber-500" />
                                                <span>{req.trustScore}</span>
                                                <span className="text-slate-400 font-medium">Trust Score</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CỤM NÚT HÀNH ĐỘNG CÓ LOADING */}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleAction(req.id, "REJECT")}
                                            disabled={isProcessing}
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 rounded-full text-red-500 border-red-100 bg-red-50 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm disabled:opacity-50"
                                        >
                                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            onClick={() => handleAction(req.id, "APPROVE")}
                                            disabled={isProcessing}
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 rounded-full text-green-600 border-green-100 bg-green-50 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-sm disabled:opacity-50"
                                        >
                                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-5 w-5 stroke-[3]" />}
                                        </Button>
                                    </div>

                                </div>
                            );
                        })
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}