"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Clock, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { ApiError } from "@/services/fetchWrapper";
import { requestJoinTrip, type JoinStatus } from "@/services/trips";

type JoinButtonStatus = JoinStatus | "NONE";

interface JoinTripButtonProps {
    tripId: string;
    initialStatus?: JoinButtonStatus | null;
    onSuccess?: () => void;
}

export default function JoinTripButton({ tripId, initialStatus = "NONE", onSuccess }: JoinTripButtonProps) {
    const [status, setStatus] = useState<JoinButtonStatus>(initialStatus ?? "NONE");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setStatus(initialStatus ?? "NONE");
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [initialStatus]);

    const handleJoinClick = async () => {
        setIsLoading(true);
        setError("");

        try {
            await requestJoinTrip(tripId);
            setStatus("PENDING");
            onSuccess?.();
        } catch (joinError) {
            if (joinError instanceof ApiError && joinError.status === 401) {
                setError("Bạn cần đăng nhập để xin tham gia chuyến đi.");
            } else {
                setError(joinError instanceof Error ? joinError.message : "Không thể gửi yêu cầu.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "APPROVED") {
        return (
            <Button disabled className="w-full sm:w-auto bg-green-50 text-green-600 border border-green-200 opacity-100 font-bold hover:bg-green-50 cursor-default">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Đã tham gia
            </Button>
        );
    }

    if (status === "PENDING") {
        return (
            <Button variant="outline" disabled className="w-full sm:w-auto text-amber-600 border-amber-200 bg-amber-50/50 opacity-100 font-bold cursor-default">
                <Clock className="mr-2 h-5 w-5" />
                Đang chờ duyệt
            </Button>
        );
    }

    if (status === "REJECTED") {
        return (
            <div className="space-y-2">
                <Button variant="outline" disabled className="w-full sm:w-auto text-rose-600 border-rose-200 bg-rose-50 opacity-100 font-bold cursor-not-allowed">
                    <XCircle className="mr-2 h-5 w-5" />
                    Không thể xin lại
                </Button>
                <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">
                    Leader đã từ chối yêu cầu trước đó. Vui lòng tìm chuyến đi khác.
                </p>
            </div>
        );
    }

    if (status === "REMOVED") {
        return (
            <div className="space-y-2">
                <Button variant="outline" disabled className="w-full sm:w-auto text-red-600 border-red-200 bg-red-50 opacity-100 font-bold cursor-not-allowed">
                    <XCircle className="mr-2 h-5 w-5" />
                    Đã bị xóa khỏi nhóm
                </Button>
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                    Leader đã xóa bạn khỏi nhóm của chuyến đi này. Bạn không thể xin tham gia lại, hãy tìm chuyến đi khác.
                </p>
            </div>
        );
    }

    if (status === "LEFT") {
        return (
            <div className="space-y-2">
                <Button variant="outline" disabled className="w-full sm:w-auto text-slate-600 border-slate-200 bg-slate-50 opacity-100 font-bold cursor-not-allowed">
                    <XCircle className="mr-2 h-5 w-5" />
                    Đã rời nhóm
                </Button>
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
                    Bạn đã tự rời nhóm của chuyến đi này. Bạn không thể xin tham gia lại, hãy tìm chuyến đi khác.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
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
            {error && (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
