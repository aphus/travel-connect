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

interface KickMemberActionProps {
    tripId: string;
    memberId: string;
    memberName: string;
    onSuccess?: () => void;
    children: React.ReactNode;
}

export default function KickMemberAction({ tripId, memberId, memberName, onSuccess, children }: KickMemberActionProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleKick = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            /* ==========================================
               GỌI API BACKEND (UC-06: Kick thành viên)
            ========================================== */
            // const response = await fetch(`/api/trips/${tripId}/members/${memberId}/kick`, {
            //   method: "POST", // Hoặc DELETE
            // });
            // if (!response.ok) throw new Error("Kick thất bại");

            /* GIẢ LẬP FRONTEND */
            await new Promise((resolve) => setTimeout(resolve, 800));

            console.log(`Đã kick thành viên ${memberName} khỏi chuyến đi ${tripId}`);
            // TODO: Kích hoạt fetch lại danh sách thành viên hoặc xóa khỏi state
            setIsOpen(false);
            if (onSuccess) onSuccess();
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
                    <AlertDialogTitle>Xóa {memberName} khỏi nhóm?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Người này sẽ bị đưa ra khỏi nhóm Chat và không thể tham gia chuyến đi nữa. Bạn có chắc chắn muốn thực hiện hành động này?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleKick}
                        disabled={isProcessing}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Xác nhận Xóa
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}