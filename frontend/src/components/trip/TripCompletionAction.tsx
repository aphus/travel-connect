"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Loader2, Flag } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { confirmTripCompletion, markTripCompleted } from "@/services/trips";

export type TripCompletionStatus = "ONGOING" | "AWAITING_CONFIRMATION" | "COMPLETED";

interface TripCompletionActionProps {
    tripId: string;
    initialStatus: TripCompletionStatus;
    isLeader: boolean; // Dùng để xác định góc nhìn hiển thị
    onCompleted?: () => void;
}

export default function TripCompletionAction({ tripId, initialStatus, isLeader, onCompleted }: TripCompletionActionProps) {
    const [status, setStatus] = useState<TripCompletionStatus>(initialStatus);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setStatus(initialStatus);
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [initialStatus]);

    // HÀM DÀNH CHO LEADER
    const handleLeaderComplete = async () => {
        setIsProcessing(true);
        setError("");

        try {
            const result = await markTripCompleted(tripId);
            setStatus(result.status === "completed" ? "COMPLETED" : "AWAITING_CONFIRMATION");
            setIsOpen(false);
            onCompleted?.();
        } catch (completeError) {
            setError(completeError instanceof Error ? completeError.message : "Không thể hoàn thành chuyến đi.");
        } finally {
            setIsProcessing(false);
        }
    };

    // HÀM DÀNH CHO MEMBER
    const handleMemberConfirm = async () => {
        setIsProcessing(true);
        setError("");

        try {
            const result = await confirmTripCompletion(tripId);
            setStatus(result.trip_status === "completed" ? "COMPLETED" : "AWAITING_CONFIRMATION");
            onCompleted?.();
        } catch (confirmError) {
            setError(confirmError instanceof Error ? confirmError.message : "Không thể xác nhận hoàn thành chuyến đi.");
        } finally {
            setIsProcessing(false);
        }
    };

    /* --- RENDER GIAO DIỆN THEO TỪNG TRẠNG THÁI --- */

    // TRẠNG THÁI 1: CHUYẾN ĐI ĐANG DIỄN RA
    if (status === "ONGOING") {
        // Chỉ Leader mới thấy nút này, Member không thấy gì
        if (!isLeader) return null;

        return (
            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialogTrigger asChild>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all mt-4">
                        <Flag className="h-4 w-4 mr-2" /> Đánh dấu hoàn thành
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Xác nhận chuyến đi đã kết thúc?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Sau khi xác nhận, chuyến đi sẽ chuyển sang trạng thái chờ thành viên xác nhận trước khi hoàn thành.
                        </AlertDialogDescription>
                        {error && (
                            <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                                {error}
                            </p>
                        )}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); handleLeaderComplete(); }}
                            disabled={isProcessing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Xác nhận hoàn thành
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }

    // TRẠNG THÁI 2: CHỜ XÁC NHẬN (Double-confirm)
    if (status === "AWAITING_CONFIRMATION") {
        if (isLeader) {
            // Góc nhìn Leader: Banner chờ đợi
            return (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-amber-500 animate-spin shrink-0" />
                    <p className="text-sm text-amber-700 font-medium">Đang chờ các thành viên xác nhận hoàn thành chuyến đi...</p>
                </div>
            );
        }

        // Góc nhìn Member: Banner kêu gọi xác nhận
        return (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-blue-600 shrink-0" />
                    <p className="text-sm text-blue-800 font-medium">
                        Leader đã đánh dấu chuyến đi này là hoàn thành. Vui lòng xác nhận để kết thúc chuyến đi và tiến hành đánh giá tín nhiệm.
                    </p>
                </div>
                <Button
                    onClick={handleMemberConfirm}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    {isProcessing ? "Đang xử lý..." : "Xác nhận chuyến đi kết thúc"}
                </Button>
                {error && (
                    <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                        {error}
                    </p>
                )}
            </div>
        );
    }

    // TRẠNG THÁI 3: ĐÃ HOÀN THÀNH
    if (status === "COMPLETED") {
        return (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Chuyến đi đã hoàn thành</span>
            </div>
        );
    }

    return null;
}
