"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function LeaveTripAction({ tripId, status, children }: { tripId: string, status: "PENDING" | "APPROVED", children: React.ReactNode }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            /* ==========================================
               GỌI API BACKEND (UC-06 Tự rời nhóm)
            ========================================== */
            // const endpoint = status === "PENDING" ? `/api/requests/${tripId}/cancel` : `/api/trips/${tripId}/leave`;
            // const response = await fetch(endpoint, { method: "POST" });
            // if (!response.ok) throw new Error("Thao tác thất bại");

            /* GIẢ LẬP FRONTEND (Xóa khi có API) */
            await new Promise((resolve) => setTimeout(resolve, 1000));

            console.log(`Đã ${status === "PENDING" ? "hủy yêu cầu" : "rời nhóm"}: ${tripId}`);
            setIsOpen(false);
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {status === "PENDING" ? "Rút lại đơn xin tham gia?" : "Rời khỏi chuyến đi này?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {status === "PENDING"
                            ? "Đơn của bạn sẽ bị hủy bỏ và Leader sẽ không nhìn thấy yêu cầu của bạn nữa."
                            : "Bạn sẽ không thể xem nội dung Chat và phải xin Leader duyệt lại nếu muốn quay lại."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isProcessing}>Quay lại</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleAction}
                        disabled={isProcessing}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Xác nhận
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}