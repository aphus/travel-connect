"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, UserCircle, LayoutList, LogOut, Menu, LogIn, MessageCircle, Bell } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


export default function SmartHeader() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const pathname = usePathname();

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

                            {/* 2. NÚT THÔNG BÁO (Tuỳ chọn thêm để Header cân đối hơn) */}
                            <button
                                className={`relative p-2 rounded-full transition-all hover:scale-105 hidden sm:block ${isTransparentHeader ? "text-white hover:bg-white/20" : "text-slate-600 hover:bg-slate-100"
                                    }`}
                                title="Thông báo"
                            >
                                <Bell className="h-6 w-6" />
                            </button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    {/* Nút Avatar viên thuốc (Nền trắng) - Phù hợp với mọi loại nền */}
                                    <button className="flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-300 pl-4 pr-1.5 py-1.5 rounded-full shadow-sm transition-all">
                                        <Menu className="h-5 w-5 text-slate-700" />
                                        <Avatar className="h-8 w-8 border-0 rounded-full">
                                            <AvatarFallback className="bg-slate-800 text-white font-bold rounded-full text-xs">
                                                ĐT
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-56 mt-4 border-slate-100 shadow-xl rounded-2xl bg-white p-2">
                                    <DropdownMenuLabel className="font-bold text-slate-900 px-4 py-2">Tài khoản của tôi</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-slate-100" />
                                    <Link href="/profile">
                                        <DropdownMenuItem className="cursor-pointer gap-3 py-2.5 px-4 rounded-xl hover:bg-slate-50">
                                            <UserCircle className="h-4 w-4 text-slate-500" /> Hồ sơ cá nhân
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/trips/manage">
                                        <DropdownMenuItem className="cursor-pointer gap-3 py-2.5 px-4 rounded-xl hover:bg-slate-50">
                                            <LayoutList className="h-4 w-4 text-slate-500" /> Quản lý chuyến đi
                                        </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuSeparator className="bg-slate-100" />
                                    <DropdownMenuItem onClick={() => setIsLoggedIn(false)} className="cursor-pointer gap-3 py-2.5 px-4 rounded-xl text-red-600 focus:text-red-600 focus:bg-red-50">
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
                                <button onClick={() => setIsLoggedIn(true)} className="flex items-center gap-2 bg-blue-600 text-white font-extrabold text-sm px-6 py-2.5 rounded-full shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200">
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