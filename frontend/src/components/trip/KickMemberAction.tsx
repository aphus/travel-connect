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
import { removeTripMember } from "@/services/trips";

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
    const [error, setError] = useState("");

    const handleKick = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setError("");

        try {
            await removeTripMember(tripId, memberId);
            setIsOpen(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Không thể xóa thành viên.");
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
                    {error && (
                        <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                            {error}
                        </p>
                    )}
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
