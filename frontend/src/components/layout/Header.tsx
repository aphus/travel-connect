"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, UserCircle, LayoutList, LogOut, Menu, LogIn, MessageCircle, Bell, CheckCheck } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { clearAccessToken, getAccessToken } from "@/services/fetchWrapper";
import { getCurrentUser, getStoredAuthUser, storeAuthUser, type AuthUser } from "@/services/auth";
import { getUserInitials } from "@/lib/user";
import {
    getNotifications,
    getUnreadNotificationCount,
    markAllNotificationsRead,
    markNotificationRead,
    type Notification,
} from "@/services/notifications";


export default function SmartHeader() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const loadNotifications = useCallback(async () => {
        if (!getAccessToken()) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        setIsNotificationsLoading(true);

        try {
            const [items, count] = await Promise.all([
                getNotifications(),
                getUnreadNotificationCount(),
            ]);
            setNotifications(items);
            setUnreadCount(count);
        } catch {
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setIsNotificationsLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const syncAuthState = async () => {
            const token = getAccessToken();
            const storedUser = getStoredAuthUser();

            if (!token) {
                setIsLoggedIn(false);
                setCurrentUser(null);
                setNotifications([]);
                setUnreadCount(0);
                return;
            }

            setIsLoggedIn(true);
            if (storedUser) setCurrentUser(storedUser);
            void loadNotifications();

            try {
                const freshUser = await getCurrentUser();
                if (!isMounted) return;

                setCurrentUser(freshUser);
                storeAuthUser(freshUser, false);
            } catch {
                if (!isMounted) return;

                clearAccessToken();
                setIsLoggedIn(false);
                setCurrentUser(null);
                setNotifications([]);
                setUnreadCount(0);
            }
        };

        void syncAuthState();
        window.addEventListener("storage", syncAuthState);
        window.addEventListener("auth-token-changed", syncAuthState);
        window.addEventListener("auth-user-changed", syncAuthState);

        return () => {
            isMounted = false;
            window.removeEventListener("storage", syncAuthState);
            window.removeEventListener("auth-token-changed", syncAuthState);
            window.removeEventListener("auth-user-changed", syncAuthState);
        };
    }, [loadNotifications]);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.readAt) {
            setUnreadCount((count) => Math.max(0, count - 1));
            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === notification.id
                        ? { ...item, readAt: new Date().toISOString() }
                        : item,
                ),
            );
            await markNotificationRead(notification.id).catch(() => null);
        }

        if (notification.targetUrl) {
            router.push(notification.targetUrl);
        }
    };

    const handleMarkAllNotificationsRead = async () => {
        setUnreadCount(0);
        setNotifications((prev) =>
            prev.map((notification) => ({
                ...notification,
                readAt: notification.readAt ?? new Date().toISOString(),
            })),
        );
        await markAllNotificationsRead().catch(() => null);
    };

    const handleLogout = () => {
        clearAccessToken();
        setIsLoggedIn(false);
        setCurrentUser(null);
        setNotifications([]);
        setUnreadCount(0);
        router.push("/login");
    };

    // 1. Ẩn Header ở trang Login / Register
    if (pathname === "/login" || pathname === "/register") {
        return null;
    }

    // 2. Kiểm tra xem có phải trang chủ không
    const isTransparentHeader = pathname === "/" || pathname === "/trips/manage";

    return (
        // LỚP VỎ NGOÀI: 
        // - Trang chủ: absolute top-0 (Không nền, lơ lửng sát viền trên)
        // - Trang khác: sticky top-0, nền trắng, viền dưới
        <header
            className={`w-full z-50 transition-all duration-300 ${isTransparentHeader
                ? "absolute top-0 left-0 right-0 pt-4"
                : "sticky top-0 bg-white border-b border-slate-200 shadow-sm"
                }`}
        >

            {/* LỚP CHỨA BÊN TRONG: Luôn trải dài max-w-7xl */}
            <div className="container mx-auto max-w-7xl h-16 px-6 md:px-10 flex items-center justify-between">

                {/* LOGO */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="bg-blue-600 rounded-xl p-2 transition-transform group-hover:scale-105 shadow-sm">
                        <Compass className="h-6 w-6 text-white" />
                    </div>
                    {/* Đổi màu chữ Logo linh hoạt: Trắng (Trang chủ) / Đen (Trang khác) */}
                    <span className={`text-2xl font-black tracking-tight ${isTransparentHeader ? "text-white drop-shadow-md" : "text-slate-900"
                        }`}>
                        TripConnect
                    </span>
                </Link>

                {/* KHU VỰC TÀI KHOẢN */}
                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            {/* 1. NÚT CHAT TOÀN CỤC */}
                            <Link href="/chat">
                                <button
                                    className={`relative p-2 rounded-full transition-all hover:scale-105 ${isTransparentHeader ? "text-white hover:bg-white/20" : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                    title="Tin nhắn"
                                >
                                    <MessageCircle className="h-6 w-6" />
                                    {/* Chấm đỏ báo có tin nhắn mới */}
                                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                                    </span>
                                </button>
                            </Link>

                            <DropdownMenu onOpenChange={(open) => open && void loadNotifications()}>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className={`relative p-2 rounded-full transition-all hover:scale-105 hidden sm:block ${isTransparentHeader ? "text-white hover:bg-white/20" : "text-slate-600 hover:bg-slate-100"
                                            }`}
                                        title="Thông báo"
                                    >
                                        <Bell className="h-6 w-6" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black leading-none text-white ring-2 ring-white">
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="mt-4 w-96 rounded-2xl border-slate-100 bg-white p-2 shadow-xl">
                                    <div className="flex items-center justify-between px-3 py-2">
                                        <DropdownMenuLabel className="p-0 text-sm font-black text-slate-900">
                                            Thông báo
                                        </DropdownMenuLabel>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllNotificationsRead}
                                                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50"
                                            >
                                                <CheckCheck className="h-3.5 w-3.5" />
                                                Đã đọc
                                            </button>
                                        )}
                                    </div>
                                    <DropdownMenuSeparator className="bg-slate-100" />
                                    {isNotificationsLoading ? (
                                        <div className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                                            Đang tải thông báo...
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                                            Chưa có thông báo mới.
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <DropdownMenuItem
                                                key={notification.id}
                                                onSelect={(event) => {
                                                    event.preventDefault();
                                                    void handleNotificationClick(notification);
                                                }}
                                                className="cursor-pointer items-start gap-3 rounded-xl px-3 py-3 focus:bg-slate-50"
                                            >
                                                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${notification.readAt ? "bg-slate-200" : "bg-blue-500"}`} />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-extrabold text-slate-900">
                                                        {notification.title}
                                                    </span>
                                                    <span className="mt-0.5 line-clamp-2 block text-xs font-medium leading-5 text-slate-500">
                                                        {notification.message}
                                                    </span>
                                                    <span className="mt-1 block text-[11px] font-bold text-slate-400">
                                                        {formatNotificationTime(notification.createdAt)}
                                                    </span>
                                                </span>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    {/* Nút Avatar viên thuốc (Nền trắng) - Phù hợp với mọi loại nền */}
                                    <button className="flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-300 pl-4 pr-1.5 py-1.5 rounded-full shadow-sm transition-all">
                                        <Menu className="h-5 w-5 text-slate-700" />
                                        <Avatar className="h-8 w-8 border-0 rounded-full">
                                            <AvatarFallback className="bg-slate-800 text-white font-bold rounded-full text-xs">
                                                {getUserInitials(currentUser)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-56 mt-4 border-slate-100 shadow-xl rounded-2xl bg-white p-2">
                                    <DropdownMenuLabel className="px-4 py-2">
                                        <span className="block font-bold text-slate-900 truncate">
                                            {currentUser?.fullName ?? "Tài khoản của tôi"}
                                        </span>
                                        {currentUser?.email && (
                                            <span className="block text-xs font-medium text-slate-500 truncate">
                                                {currentUser.email}
                                            </span>
                                        )}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-slate-100" />
                                    <DropdownMenuItem asChild className="cursor-pointer gap-3 py-2.5 px-4 rounded-xl hover:bg-slate-50">
                                        <Link href="/profile">
                                            <UserCircle className="h-4 w-4 text-slate-500" /> Hồ sơ cá nhân
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer gap-3 py-2.5 px-4 rounded-xl hover:bg-slate-50">
                                        <Link href="/trips/manage">
                                            <LayoutList className="h-4 w-4 text-slate-500" /> Quản lý chuyến đi
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-100" />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-3 py-2.5 px-4 rounded-xl text-red-600 focus:text-red-600 focus:bg-red-50">
                                        <LogOut className="h-4 w-4" /> Đăng xuất
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            {/* Đổi màu chữ Đăng ký linh hoạt: Trắng (Trang chủ) / Xám (Trang khác) */}
                            <Link
                                href="/register"
                                className={`font-bold text-sm transition-colors px-4 py-2 ${isTransparentHeader ? "text-white hover:text-slate-200 drop-shadow-sm" : "text-slate-700 hover:text-blue-600"
                                    }`}
                            >
                                Đăng ký
                            </Link>
                            <Link href="/login">
                                <button className="flex items-center gap-2 bg-blue-600 text-white font-extrabold text-sm px-6 py-2.5 rounded-full shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200">
                                    <LogIn className="h-4 w-4 stroke-[3]" />
                                    Đăng nhập
                                </button>
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </header >
    );
}

function formatNotificationTime(value: string) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
    }).format(date);
}
