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
import { cancelTrip } from "@/services/trips";

export default function CancelTripAction({ tripId, children, onSuccess }: { tripId: string, children: React.ReactNode, onSuccess?: () => void }) {
    const [isCanceling, setIsCanceling] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleCancelTrip = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsCanceling(true);

        try {
            await cancelTrip(tripId);
            onSuccess?.();
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
