"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, Star, Loader2 } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    approveTripJoinRequest,
    getTripJoinRequests,
    rejectTripJoinRequest,
    type TripJoinRequest,
} from "@/services/trips";

type ApprovalSheetProps = {
    tripId: string;
    onChanged?: () => void;
    children: React.ReactNode;
};

export default function ApprovalSheet({ tripId, onChanged, children }: ApprovalSheetProps) {
    const [requests, setRequests] = useState<TripJoinRequest[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    const loadRequests = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            setRequests(await getTripJoinRequests(tripId));
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Không thể tải yêu cầu tham gia.");
        } finally {
            setIsLoading(false);
        }
    }, [tripId]);

    useEffect(() => {
        if (isOpen) {
            void loadRequests();
        }
    }, [isOpen, loadRequests]);

    const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
        setProcessingId(id);
        setError("");

        try {
            if (action === "APPROVE") {
                await approveTripJoinRequest(tripId, id);
            } else {
                await rejectTripJoinRequest(tripId, id);
            }

            setRequests((prev) => prev.filter((req) => req.id !== id));
            onChanged?.();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Xử lý yêu cầu thất bại.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>

            <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50">
                <SheetHeader className="mb-6 mt-4">
                    <SheetTitle className="text-xl font-black text-slate-900">Yêu cầu tham gia</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-3">
                    {error && (
                        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center text-slate-500 py-10 bg-white rounded-2xl border border-slate-100 border-dashed font-medium">
                            Chưa có yêu cầu tham gia nào đang chờ.
                        </div>
                    ) : (
                        requests.map((req) => {
                            const isProcessing = processingId === req.id;
                            const initials = getInitials(req.user.fullName);

                            return (
                                <div key={req.id} className="flex items-center justify-between p-3.5 border border-slate-200/60 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all">

                                    <Link
                                        href={`/profile/${req.user.id}`}
                                        className="flex min-w-0 items-center gap-3.5 rounded-xl pr-2 transition-colors hover:bg-slate-50"
                                        title={`Xem trang cá nhân của ${req.user.fullName}`}
                                    >
                                        <Avatar className="h-11 w-11">
                                            <AvatarImage src={req.user.avatarUrl ?? undefined} />
                                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{initials}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">{req.user.fullName}</h4>
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 mt-1">
                                                <Star className="h-3.5 w-3.5 fill-amber-500" />
                                                <span>{req.user.trustScore}</span>
                                                <span className="text-slate-400 font-medium">Trust Score</span>
                                            </div>
                                            {req.message && (
                                                <p className="mt-1 max-w-[190px] text-xs text-slate-500 line-clamp-2">
                                                    {req.message}
                                                </p>
                                            )}
                                        </div>
                                    </Link>

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

function getInitials(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (words.length === 0) return "TC";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words.map((word) => word[0]).join("").toUpperCase();
}
