"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Đảm bảo đường dẫn tới file Button của shadcn/ui là chính xác
import { UserPlus, Clock, CheckCircle2, Loader2 } from "lucide-react";

// Định nghĩa 3 trạng thái tĩnh từ Backend trả về
export type JoinStatus = "NONE" | "PENDING" | "JOINED";

interface JoinTripButtonProps {
    tripId: string;
    initialStatus?: JoinStatus; // Nhận trạng thái ban đầu từ API gọi lúc load trang
}

export default function JoinTripButton({ tripId, initialStatus = "NONE" }: JoinTripButtonProps) {
    // State quản lý giao diện hiện tại
    const [status, setStatus] = useState<JoinStatus>(initialStatus);
    // State quản lý hiệu ứng loading khi bấm nút
    const [isLoading, setIsLoading] = useState(false);

    // Hàm xử lý sự kiện bấm nút - CHỈ CHỨA LOGIC FRONTEND
    const handleJoinClick = async () => {
        setIsLoading(true);

        // TƯƠNG LAI: Chỗ này bạn sẽ gọi API của backend
        // Ví dụ: const response = await api.post(`/trips/${tripId}/join`);

        // GIẢ LẬP HIỆU ỨNG: Chờ 1 giây rồi đổi UI sang trạng thái "PENDING"
        setTimeout(() => {
            setStatus("PENDING");
            setIsLoading(false);
        }, 1000);
    };

    /* --- RENDER GIAO DIỆN THEO TỪNG TRẠNG THÁI --- */

    // 1. Giao diện: ĐÃ THAM GIA
    if (status === "JOINED") {
        return (
            <Button disabled className="w-full sm:w-auto bg-green-50 text-green-600 border border-green-200 opacity-100 font-bold hover:bg-green-50 cursor-default">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Đã tham gia
            </Button>
        );
    }

    // 2. Giao diện: ĐANG CHỜ DUYỆT
    if (status === "PENDING") {
        return (
            <Button variant="outline" disabled className="w-full sm:w-auto text-amber-600 border-amber-200 bg-amber-50/50 opacity-100 font-bold cursor-default">
                <Clock className="mr-2 h-5 w-5" />
                Đang chờ duyệt
            </Button>
        );
    }

    // 3. Giao diện: CHƯA THAM GIA (Mặc định)
    return (
        <Button
            onClick={handleJoinClick}
            disabled={isLoading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
                <UserPlus className="mr-2 h-5 w-5" />
            )}
            {isLoading ? "Đang gửi yêu cầu..." : "Xin tham gia chuyến đi"}
        </Button>
    );
}