"use client";

import Link from "next/link";
import { Compass, UserCircle, LayoutList, LogOut } from "lucide-react";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
            <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 md:px-8">

                {/* LOGO - NẰM SÁT TRÁI */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-blue-600 rounded-lg p-1.5 group-hover:bg-orange-500 transition-colors">
                        <Compass className="h-5 w-5 text-white animate-pulse" />
                    </div>
                    <span className="text-xl font-extrabold text-slate-900 tracking-tight">TripConnect</span>
                </Link>

                {/* AVATAR - NẰM SÁT PHẢI */}
                <div className="flex items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="h-10 w-10 cursor-pointer border-2 border-slate-200 hover:border-orange-400 transition-colors">
                                <AvatarFallback className="bg-slate-100 text-slate-700 font-bold">ĐT</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2">
                            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href="/profile">
                                <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                                    <UserCircle className="h-4 w-4 text-slate-500" /> Hồ sơ cá nhân
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/trips/manage">
                                <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                                    <LayoutList className="h-4 w-4 text-slate-500" /> Quản lý chuyến đi
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer gap-2 py-2 text-red-600 focus:text-red-600 focus:bg-red-50">
                                <LogOut className="h-4 w-4" /> Đăng xuất
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

            </div>
        </header>
    );
}