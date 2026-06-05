"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Map, AlertTriangle, ShieldCheck } from "lucide-react";


export default function AdminSidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Quản lý Người dùng", href: "/admin/users", icon: Users },
        { name: "Quản lý Chuyến đi", href: "/admin/trips", icon: Map },
        { name: "Quản lý Báo cáo", href: "/admin/reports", icon: AlertTriangle },
        { name: "Xác minh danh tính", href: "/admin/identity-verifications", icon: ShieldCheck },
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
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

        </aside>
    );
}
