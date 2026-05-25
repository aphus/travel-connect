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

export default function CancelTripAction({ tripId, children }: { tripId: string, children: React.ReactNode }) {
    const [isCanceling, setIsCanceling] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleCancelTrip = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsCanceling(true);

        try {
            /* ==========================================
               GỌI API BACKEND (UC-03 Hủy chuyến đi)
            ========================================== */
            // const response = await fetch(`/api/trips/${tripId}/cancel`, {
            //   method: "POST", // Hoặc DELETE/PATCH
            //   headers: { "Content-Type": "application/json" },
            // });
            // if (!response.ok) throw new Error("Hủy chuyến đi thất bại");

            /* GIẢ LẬP FRONTEND (Xóa khi có API) */
            await new Promise((resolve) => setTimeout(resolve, 1000));

            console.log(`Đã hủy chuyến đi: ${tripId}`);
            // TODO: Cập nhật lại danh sách chuyến đi hoặc báo thành công
            setIsOpen(false);
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setIsCanceling(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Hủy chuyến đi này?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Chuyến đi sẽ bị đánh dấu là "Đã hủy" và tất cả thành viên sẽ nhận được thông báo.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isCanceling}>Đóng</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleCancelTrip}
                        disabled={isCanceling}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isCanceling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Chắc chắn hủy
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}