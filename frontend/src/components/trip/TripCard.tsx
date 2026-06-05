import React from 'react';
import Link from 'next/link';
import { Calendar, DollarSign, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { JoinStatus } from '@/services/trips';

// 1. Định nghĩa cấu trúc dữ liệu (Props) mà thẻ này sẽ nhận vào
export interface Trip {
    id: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    budget: string;
    currentMembers: number;
    maxMembers: number;
    coverUrl: string;
    leader: {
        name: string;
        avatarUrl?: string;
        trustScore: number;
    };
    status?: string;
    joinStatus?: JoinStatus;
    leaderMarkedCompleted?: boolean;
}

interface TripCardProps {
    trip: Trip;
    variant?: "default" | "feed";
}

export default function TripCard({ trip, variant = "default" }: TripCardProps) {
    // Logic kiểm tra nhóm đã đủ người chưa
    const isFull = trip.currentMembers >= trip.maxMembers;
    const isCompleted = trip.status === 'completed';
    const joinButtonMeta = getJoinButtonMeta(trip.joinStatus, isFull, isCompleted);
    const isFeed = variant === "feed";

    return (
        <Link
            href={`/trips/${trip.id}`}
            className={cn(
                "block h-full cursor-pointer transition-transform duration-300",
                isFeed ? "hover:-translate-y-0.5" : "hover:-translate-y-1",
            )}
        >
            <Card
                className={cn(
                    "flex h-full flex-col overflow-hidden border-slate-200 transition-shadow duration-300 hover:shadow-lg",
                    isFeed && "rounded-xl shadow-sm",
                )}
            >
                <div
                    className={cn(
                        "relative w-full bg-slate-100",
                        isFeed ? "aspect-[16/9]" : "h-48",
                    )}
                >
                    <img
                        src={trip.coverUrl || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"}
                        alt={trip.title}
                        className="object-cover w-full h-full"
                    />
                    {!isFeed && (
                        <Badge className="absolute top-3 right-3 bg-white/90 text-blue-600 hover:bg-white shadow-sm border-none">
                            {trip.location}
                        </Badge>
                    )}
                </div>

                <CardContent className={cn("flex-1 p-5", isFeed && "p-5 sm:p-6")}>
                    <h3
                        className={cn(
                            "mb-4 line-clamp-2 font-bold leading-tight text-slate-900",
                            isFeed ? "text-2xl" : "text-xl",
                        )}
                    >
                        {trip.title}
                    </h3>
                    <div
                        className={cn(
                            "text-sm font-medium text-slate-600",
                            isFeed ? "grid gap-3 sm:grid-cols-2" : "space-y-2.5",
                        )}
                    >
                        <div
                            className={cn(
                                "flex items-start gap-3",
                                isFeed && "sm:col-span-2",
                            )}
                        >
                            <div className="rounded-md bg-rose-50 p-1.5">
                                <MapPin className="h-4 w-4 text-rose-600" />
                            </div>
                            <span className="line-clamp-2 font-semibold text-slate-700">
                                {trip.location}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-1.5 rounded-md"><Calendar className="w-4 h-4 text-blue-600" /></div>
                            <span>{trip.startDate} - {trip.endDate}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-green-50 p-1.5 rounded-md"><DollarSign className="w-4 h-4 text-green-600" /></div>
                            <span>{trip.budget}</span>
                        </div>
                        <div className={cn("flex items-center justify-between", !isFeed && "mt-4")}>
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-50 p-1.5 rounded-md"><Users className="w-4 h-4 text-orange-600" /></div>
                                <span>{trip.currentMembers} / {trip.maxMembers} thành viên</span>
                            </div>
                            {isFull && !isCompleted && (
                                <Badge variant="destructive" className="text-[10px]">Đã đủ người</Badge>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter
                    className={cn(
                        "mt-auto flex items-center justify-between border-t bg-slate-50 p-5",
                        isFeed && "p-4 sm:px-6",
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                            <AvatarImage src={trip.leader.avatarUrl} alt={trip.leader.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{trip.leader.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 leading-none mb-1">{trip.leader.name}</span>
                            <span className="text-xs font-medium text-slate-500">Trust Score: <span className="text-blue-600">{trip.leader.trustScore}</span></span>
                        </div>
                    </div>
                    <Button size="sm" className={joinButtonMeta.className} disabled={joinButtonMeta.disabled}>
                        {joinButtonMeta.label}
                    </Button>
                </CardFooter>

            </Card>
        </Link>
    );
}

function getJoinButtonMeta(
    joinStatus: JoinStatus | undefined,
    isFull: boolean,
    isCompleted: boolean,
) {
    if (joinStatus === "REJECTED") {
        return {
            disabled: true,
            label: "Bị từ chối",
            className: "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-50 font-semibold opacity-100 cursor-not-allowed",
        };
    }

    if (joinStatus === "REMOVED") {
        return {
            disabled: true,
            label: "Đã bị xóa",
            className: "border border-red-200 bg-red-50 text-red-600 hover:bg-red-50 font-semibold opacity-100 cursor-not-allowed",
        };
    }

    if (joinStatus === "LEFT") {
        return {
            disabled: true,
            label: "Đã rời nhóm",
            className: "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-50 font-semibold opacity-100 cursor-not-allowed",
        };
    }

    if (joinStatus === "PENDING") {
        return {
            disabled: true,
            label: "Đang chờ",
            className: "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50 font-semibold opacity-100 cursor-default",
        };
    }

    if (joinStatus === "APPROVED") {
        return {
            disabled: true,
            label: "Đã tham gia",
            className: "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 font-semibold opacity-100 cursor-default",
        };
    }

    if (isCompleted) {
        return {
            disabled: true,
            label: "Đã hoàn thành",
            className: "bg-slate-100 text-slate-500 hover:bg-slate-100 font-semibold opacity-100 cursor-default",
        };
    }

    if (isFull) {
        return {
            disabled: true,
            label: "Đã chốt",
            className: "bg-slate-100 text-slate-500 hover:bg-slate-100 font-semibold opacity-100 cursor-default",
        };
    }

    return {
        disabled: false,
        label: "Tham gia",
        className: "bg-blue-600 hover:bg-blue-700 font-semibold",
    };
}
