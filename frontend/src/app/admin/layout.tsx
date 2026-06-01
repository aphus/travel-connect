"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getStoredAuthUser, type AuthUser } from "@/services/auth";
import { clearAccessToken } from "@/services/fetchWrapper";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [adminUser, setAdminUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const user = getStoredAuthUser();
        if (user && (user.role === "ADMIN" || user.role === "admin")) {
            setAdminUser(user);
        }
    }, [pathname]);

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?")) {
            clearAccessToken();
            localStorage.removeItem("auth_user");
            setAdminUser(null);
            router.push("/admin/login");
        }
    };

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <AdminSidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* HEADER ADMIN MỚI */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0">
                    <h1 className="text-lg font-bold text-slate-800">Hệ thống Quản trị TripConnect</h1>

                    <div className="flex items-center gap-6">
                        {/* Cụm thông tin Admin */}
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-700">
                                    {adminUser?.fullName || "Admin"}
                                </p>
                                <p className="text-xs text-slate-500">Quản trị viên</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md uppercase">
                                {adminUser?.fullName?.charAt(0) || adminUser?.email?.charAt(0) || "A"}
                            </div>
                        </div>

                        {/* Nút Đăng xuất */}
                        <div className="h-8 w-px bg-slate-200"></div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors text-sm font-bold"
                        >
                            <LogOut className="w-4 h-4 stroke-[2.5]" />
                            Đăng xuất
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}