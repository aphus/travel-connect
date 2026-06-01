"use client";

import React, { useState, useEffect } from "react";
import { Search, Ban, CheckCircle, ShieldAlert, Loader2 } from "lucide-react";
import { getAllUsers, toggleUserBan, type AdminUser } from "@/services/admin";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data = await getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi khi tải danh sách người dùng:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleBan = async (user: AdminUser) => {
        if (user.role === "ADMIN" || user.role === "admin") return;

        const newBanStatus = !user.isBanned;
        const confirmMsg = newBanStatus
            ? `Bạn có chắc chắn muốn KHÓA tài khoản của ${user.fullName}?`
            : `Bạn muốn MỞ KHÓA cho tài khoản ${user.fullName}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            setActionLoadingId(user.id);

            await toggleUserBan(user.id, newBanStatus);

            setUsers(users.map(u =>
                u.id === user.id ? { ...u, isBanned: newBanStatus } : u
            ));
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            alert("Cập nhật thất bại. Vui lòng kiểm tra lại kết nối!");
        } finally {
            setActionLoadingId(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý Người dùng</h2>
                    <p className="text-slate-500 mt-1">Xem danh sách và xử lý các tài khoản vi phạm.</p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                        <p className="text-sm text-slate-500 font-medium">Đang tải dữ liệu...</p>
                    </div>
                ) : null}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Người dùng</th>
                                <th className="px-6 py-4">Vai trò</th>
                                <th className="px-6 py-4">Ngày tham gia</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => {
                                const displayName = user.fullName || user.full_name || user.email;
                                const createdDate = user.createdAt || user.created_at;
                                const isUserBanned = user.isBanned ?? user.is_banned ?? false;

                                return (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold uppercase shrink-0">
                                                    {displayName?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 line-clamp-1">{displayName}</p>
                                                    <p className="text-slate-500 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' || user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                                            {createdDate ? new Date(createdDate).toLocaleDateString('vi-VN') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {!isUserBanned ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Hoạt động
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
                                                    <ShieldAlert className="w-3.5 h-3.5" /> Bị khóa
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.role !== 'ADMIN' && user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleToggleBan(user)}
                                                    disabled={actionLoadingId === user.id}
                                                    className={`inline-flex items-center justify-center min-w-[120px] gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${!isUserBanned
                                                        ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 hover:shadow-sm'
                                                        : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:shadow-sm'
                                                        }`}
                                                >
                                                    {actionLoadingId === user.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : !isUserBanned ? (
                                                        <><Ban className="w-4 h-4" /> Khóa tài khoản</>
                                                    ) : (
                                                        <><CheckCircle className="w-4 h-4" /> Mở khóa</>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}

                            {!isLoading && filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        Không tìm thấy người dùng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}