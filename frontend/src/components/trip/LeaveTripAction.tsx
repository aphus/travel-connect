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
import { cancelOwnJoinRequest, leaveTrip } from "@/services/trips";

export default function LeaveTripAction({ tripId, status, onSuccess, children }: { tripId: string, status: "PENDING" | "APPROVED", onSuccess?: () => void, children: React.ReactNode }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");

    const handleAction = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setError("");

        try {
            if (status === "PENDING") {
                await cancelOwnJoinRequest(tripId);
            } else {
                await leaveTrip(tripId);
            }

            setIsOpen(false);
            onSuccess?.();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Không thể xử lý thao tác.");
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
                    {error && (
                        <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                            {error}
                        </p>
                    )}
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
