// src/components/chat/ChatSidebar.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn, MessageSquare } from "lucide-react";
import {
    ApiError,
    getAccessToken,
} from "@/services/fetchWrapper";
import {
    getMyCreatedTrips,
    getMyJoinedTrips,
    getTripTitle,
    type Trip,
} from "@/services/trips";
import { formatDisplayDate } from "@/lib/trip-format";

type ChatRoom = {
    id: string;
    title: string;
    subtitle: string;
    meta: string;
    avatarUrl: string;
};

interface ChatSidebarProps {
    // Nhận ID của chuyến đi hiện tại để làm nổi bật (highlight) nhóm chat đang mở
    activeTripId?: string;
}

export default function ChatSidebar({ activeTripId }: ChatSidebarProps) {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [authRequired, setAuthRequired] = useState(false);

    const loadChatRooms = useCallback(async () => {
        setIsLoading(true);
        setError("");
        setAuthRequired(false);

        if (!getAccessToken()) {
            setRooms([]);
            setAuthRequired(true);
            setIsLoading(false);
            return;
        }

        try {
            const [createdTrips, joinedTrips] = await Promise.all([
                getMyCreatedTrips(),
                getMyJoinedTrips(),
            ]);

            setRooms(
                mergeTripsForChat(createdTrips, joinedTrips).map(tripToChatRoom),
            );
        } catch (loadError) {
            if (
                loadError instanceof ApiError &&
                [401, 403].includes(loadError.status)
            ) {
                setRooms([]);
                setAuthRequired(true);
                return;
            }

            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "Không thể tải danh sách nhóm chat.",
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadChatRooms();
        }, 0);

        window.addEventListener("auth-token-changed", loadChatRooms);
        return () => {
            window.clearTimeout(timeoutId);
            window.removeEventListener("auth-token-changed", loadChatRooms);
        };
    }, [loadChatRooms]);

    return (
        <div className="w-full md:w-80 border-r border-slate-200 bg-white h-[calc(100vh-64px)] overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-slate-800">Tin nhắn nhóm</h2>
            </div>

            <div className="divide-y divide-slate-100">
                {isLoading && (
                    <SidebarState
                        icon={<Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                        title="Đang tải nhóm chat..."
                        description="TripConnect đang lấy các chuyến đi của bạn."
                    />
                )}

                {!isLoading && authRequired && (
                    <SidebarState
                        icon={<LogIn className="h-5 w-5 text-blue-600" />}
                        title="Bạn cần đăng nhập"
                        description="Đăng nhập để xem các nhóm chat theo chuyến đi."
                    >
                        <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700">
                            <Link href="/login">Đăng nhập</Link>
                        </Button>
                    </SidebarState>
                )}

                {!isLoading && !authRequired && error && (
                    <SidebarState
                        icon={<MessageSquare className="h-5 w-5 text-red-500" />}
                        title="Không thể tải nhóm chat"
                        description={error}
                    />
                )}

                {!isLoading && !authRequired && !error && rooms.length === 0 && (
                    <SidebarState
                        icon={<MessageSquare className="h-5 w-5 text-slate-400" />}
                        title="Chưa có nhóm chat"
                        description="Khi bạn tạo chuyến đi hoặc được duyệt tham gia, nhóm chat sẽ xuất hiện tại đây."
                    >
                        <Button asChild variant="outline" className="mt-4">
                            <Link href="/trips">Khám phá chuyến đi</Link>
                        </Button>
                    </SidebarState>
                )}

                {!isLoading && !authRequired && !error && rooms.map((room) => {
                    // Kiểm tra xem phòng chat này có đang được chọn hay không
                    const isActive = room.id === activeTripId;

                    return (
                        <Link
                            key={room.id}
                            href={`/chat/${room.id}`}
                            className={`flex items-center gap-3 p-4 transition-colors hover:bg-slate-50 cursor-pointer ${isActive ? "bg-blue-50/50 border-l-4 border-blue-600" : "border-l-4 border-transparent"
                                }`}
                        >
                            <Avatar className="h-12 w-12 flex-shrink-0">
                                <AvatarImage src={room.avatarUrl} />
                                <AvatarFallback className={isActive ? "bg-blue-200 text-blue-700" : "bg-slate-100 text-slate-600"}>
                                    {room.title.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`font-semibold text-sm truncate pr-2 ${isActive ? "text-blue-700" : "text-slate-900"}`}>
                                        {room.title}
                                    </h3>
                                    <span className="text-[10px] text-slate-400 flex-shrink-0">{room.meta}</span>
                                </div>
                                <p className="text-xs text-slate-500 truncate">{room.subtitle}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

function SidebarState({
    icon,
    title,
    description,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50">
                {icon}
            </div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
            {children}
        </div>
    );
}

function mergeTripsForChat(createdTrips: Trip[], joinedTrips: Trip[]) {
    const tripsById = new Map<string, Trip>();

    [...createdTrips, ...joinedTrips.filter(isApprovedJoinedTrip)].forEach((trip) => {
        tripsById.set(trip.id, trip);
    });

    return Array.from(tripsById.values()).sort(sortTripsForChat);
}

function isApprovedJoinedTrip(trip: Trip) {
    return !["PENDING", "REJECTED", "CANCELED"].includes(trip.joinStatus ?? "");
}

function sortTripsForChat(left: Trip, right: Trip) {
    return getTripSortValue(right) - getTripSortValue(left);
}

function getTripSortValue(trip: Trip) {
    return Date.parse(trip.createdAt || trip.startDate || "") || 0;
}

function tripToChatRoom(trip: Trip): ChatRoom {
    return {
        id: trip.id,
        title: getTripTitle(trip),
        subtitle: `${trip.destination} • ${trip.currentMembers}/${trip.maxMembers} thành viên`,
        meta: trip.startDate ? formatDisplayDate(trip.startDate) : "Chuyến đi",
        avatarUrl: trip.leader?.avatarUrl ?? "",
    };
}
