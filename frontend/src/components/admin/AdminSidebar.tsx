"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Map, AlertTriangle } from "lucide-react";
import { getAllReports } from "@/services/admin";

export default function AdminSidebar() {
    const pathname = usePathname();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getAllReports();
                if (Array.isArray(data)) {
                    const pending = data.filter((r: any) => r.status !== 'resolved' && r.status !== 'rejected');
                    setPendingCount(pending.length);
                }
            } catch (error) {
                console.error("Lỗi tải báo cáo sidebar:", error);
            }
        };
        fetchReports();
    }, [pathname]);

    const navItems = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Quản lý Người dùng", href: "/admin/users", icon: Users },
        { name: "Quản lý Chuyến đi", href: "/admin/trips", icon: Map },
        { name: "Quản lý Báo cáo", href: "/admin/reports", icon: AlertTriangle, hasBadge: true }, // Đánh dấu thẻ cần có Badge
    ];

    return (
        <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-xl z-20 relative">
            <div className="p-6 border-b border-slate-800">
                <h2 className="text-2xl font-black text-white tracking-tighter">
                    Trip<span className="text-blue-500">Admin</span>
                </h2>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5" />
                                <span className="font-medium text-sm">{item.name}</span>
                            </div>

                            {item.hasBadge && pendingCount > 0 && (
                                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                    {pendingCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}