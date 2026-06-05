"use client";

import React, { useState, useEffect } from "react";
import { Search, Ban, CheckCircle, ShieldAlert, Loader2, Filter, Star, Map as MapIcon, Eye, Unlock, X, Tent, Users2, Shield } from "lucide-react";
import { getAllUsers, getUserTrips, getAllReports, type AdminUser, type AdminTrip, type AdminReport } from "@/services/admin";
import { fetchWrapper } from "@/services/fetchWrapper";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [allReports, setAllReports] = useState<AdminReport[]>([]);

    // TRẠNG THÁI BỘ LỌC
    const [filterRole, setFilterRole] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'BANNED'>('ALL');

    // TRẠNG THÁI MODAL KHÓA/HỒ SƠ
    const [selectedUserForBan, setSelectedUserForBan] = useState<AdminUser | null>(null);
    const [selectedUserDetails, setSelectedUserDetails] = useState<AdminUser | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // TRẠNG THÁI MODAL CHUYẾN ĐI
    const [selectedUserForTripsModal, setSelectedUserForTripsModal] = useState<AdminUser | null>(null);
    const [isTripsLoading, setIsTripsLoading] = useState(false);
    const [tripsData, setTripsData] = useState<{ created: AdminTrip[], participated: AdminTrip[] }>({ created: [], participated: [] });
    const [activeTripTab, setActiveTripTab] = useState<'CREATED' | 'PARTICIPATED'>('CREATED');

    useEffect(() => {
        loadUsers();
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const data = await getAllReports();
            setAllReports(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi khi tải báo cáo:", error);
        }
    };

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

    // HÀM GỌI API THẬT ĐỂ LẤY CHUYẾN ĐI
    const handleOpenUserTripsModal = async (user: AdminUser) => {
        setSelectedUserForTripsModal(user);
        setIsTripsLoading(true);
        setActiveTripTab('CREATED');
        try {
            const data = await getUserTrips(user.id) as { created: AdminTrip[], participated: AdminTrip[] };
            setTripsData({
                created: data.created || [],
                participated: data.participated || []
            });
        } catch (error) {
            console.error("Lỗi khi tải chuyến đi người dùng:", error);
            alert("Không thể tải dữ liệu chuyến đi!");
        } finally {
            setIsTripsLoading(false);
        }
    };

    const handleBan = async (days?: number) => {
        if (!selectedUserForBan) return;
        setIsProcessing(true);
        try {
            const url = days
                ? `/admin/users/${selectedUserForBan.id}/ban?days=${days}`
                : `/admin/users/${selectedUserForBan.id}/ban`;

            await fetchWrapper(url, { method: "PATCH" });
            alert(`Đã khóa tài khoản thành công!`);
            setSelectedUserForBan(null);
            loadUsers();
        } catch (error) {
            alert("Lỗi khi khóa tài khoản!");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUnban = async (userId: string, userName: string) => {
        if (!window.confirm(`Bạn có chắc muốn MỞ KHÓA cho ${userName}?`)) return;
        try {
            await fetchWrapper(`/admin/users/${userId}/unban`, { method: "PATCH" });
            alert(`Đã mở khóa tài khoản thành công!`);
            loadUsers();
        } catch (error) {
            alert("Lỗi khi mở khóa tài khoản!");
        }
    };

    const filteredUsers = users.filter(user => {
        const matchSearch = (user.fullName || user.full_name || user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
        const userRole = (user.role || "").toUpperCase();
        const matchRole = filterRole === 'ALL' || userRole === filterRole;
        const isBanned = user.isBanned ?? user.is_banned ?? false;
        const matchStatus = filterStatus === 'ALL' ? true : filterStatus === 'BANNED' ? isBanned : !isBanned;
        return matchSearch && matchRole && matchStatus;
    });

    const currentTripsList = activeTripTab === 'CREATED' ? tripsData.created : tripsData.participated;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">

            {/* KHU VỰC HEADER VÀ BỘ LỌC */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý Người dùng</h2>
                    <p className="text-slate-500 mt-1">Xem danh sách, phân quyền và xử lý tài khoản.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                        {(['ALL', 'USER', 'ADMIN'] as const).map(role => (
                            <button key={role} onClick={() => setFilterRole(role)} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterRole === role ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                                {role === 'ALL' ? 'Tất cả' : role}
                            </button>
                        ))}
                    </div>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="BANNED">Đã bị khóa</option>
                    </select>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
                    </div>
                </div>
            </div>

            {/* BẢNG NGƯỜI DÙNG */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Thành viên</th>
                                <th className="px-6 py-4 text-center">Uy tín</th>
                                <th className="px-6 py-4 text-center">Hoạt động</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => {
                                const displayName = user.fullName || user.full_name || user.email;
                                const isUserBanned = user.isBanned ?? user.is_banned ?? false;
                                const isAdmin = user.role === 'ADMIN' || user.role === 'admin';
                                const trustScore = user.trust_score ?? 100;
                                const tripsCount = user.tripsCreated ?? 0;

                                return (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${(user.fullName || user.email || 'User').replace(/\s+/g, '+')}&background=random`}
                                                    alt="avatar"
                                                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                    onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${(user.fullName || user.email || 'User').replace(/\s+/g, '+')}&background=random`)}
                                                />
                                                <span className="font-medium text-slate-800">{user.fullName || user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1 font-bold">
                                                <Star className={`w-4 h-4 ${trustScore >= 80 ? 'text-amber-400' : trustScore >= 50 ? 'text-orange-400' : 'text-rose-500'}`} fill="currentColor" />
                                                <span className={trustScore >= 80 ? 'text-slate-700' : 'text-rose-600'}>{trustScore}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleOpenUserTripsModal(user)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all shadow-sm"
                                            >
                                                <MapIcon className="w-3.5 h-3.5" /> Lịch sử đi
                                            </button>
                                        </td>

                                        <td className="px-6 py-4">
                                            {!isUserBanned ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Hoạt động
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 cursor-help">
                                                    <ShieldAlert className="w-3.5 h-3.5" /> Bị khóa
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedUserDetails(user)}
                                                    className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {isAdmin ? (
                                                    <div className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold text-purple-600 bg-purple-50 border border-purple-100 cursor-default">
                                                        <Shield className="w-3.5 h-3.5" /> Admin
                                                    </div>
                                                ) : (
                                                    !isUserBanned ? (
                                                        <button
                                                            onClick={() => setSelectedUserForBan(user)}
                                                            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-transparent hover:border-rose-200 transition-all"
                                                        >
                                                            <Ban className="w-3.5 h-3.5" /> Khóa
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUnban(user.id, displayName)}
                                                            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-transparent hover:border-emerald-200 transition-all shadow-sm"
                                                        >
                                                            <Unlock className="w-3.5 h-3.5" /> Mở khóa
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {!isLoading && filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Filter className="w-12 h-12 mb-3 text-slate-200" />
                                            <p className="font-medium text-slate-500">Không tìm thấy dữ liệu phù hợp với bộ lọc.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL KHÓA TÀI KHOẢN */}
            {selectedUserForBan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50">
                            <h3 className="text-lg font-bold text-rose-700 flex items-center gap-2">
                                <Ban className="w-5 h-5" /> Xác nhận Khóa
                            </h3>
                            <button onClick={() => setSelectedUserForBan(null)} className="text-rose-400 hover:text-rose-700 p-1 rounded-full transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-600 text-center">
                                Chọn thời gian khóa tài khoản <br />
                                <span className="font-bold text-slate-900 text-base">{selectedUserForBan.fullName || selectedUserForBan.email}</span>
                            </p>
                            <div className="grid grid-cols-1 gap-3 mt-4">
                                <button onClick={() => handleBan(3)} disabled={isProcessing} className="py-3 text-sm font-bold rounded-xl border-2 border-rose-100 hover:border-rose-300 bg-white text-rose-600 transition-all">
                                    Khóa 3 Ngày
                                </button>
                                <button onClick={() => handleBan(7)} disabled={isProcessing} className="py-3 text-sm font-bold rounded-xl border-2 border-rose-100 hover:border-rose-300 bg-white text-rose-600 transition-all">
                                    Khóa 7 Ngày
                                </button>
                                <button onClick={() => handleBan()} disabled={isProcessing} className="py-3 text-sm font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md hover:shadow-lg shadow-rose-200">
                                    Khóa Vĩnh Viễn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DANH SÁCH CHUYẾN ĐI (CÓ CHIA TAB) */}
            {selectedUserForTripsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <MapIcon className="w-5 h-5 text-blue-500" /> Lịch sử Chuyến đi
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Thành viên: <span className="font-bold text-slate-700">{selectedUserForTripsModal.fullName || selectedUserForTripsModal.email}</span>
                                </p>
                            </div>
                            <button onClick={() => setSelectedUserForTripsModal(null)} className="text-slate-400 hover:text-rose-500 bg-slate-200/50 hover:bg-rose-50 p-2 rounded-full transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* TAB CHUYỂN ĐỔI */}
                        <div className="px-6 pt-4 border-b border-slate-100 flex gap-4">
                            <button
                                onClick={() => setActiveTripTab('CREATED')}
                                className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTripTab === 'CREATED' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <Tent className="w-4 h-4" /> Đã tạo ({tripsData.created.length})
                            </button>
                            <button
                                onClick={() => setActiveTripTab('PARTICIPATED')}
                                className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTripTab === 'PARTICIPATED' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <Users2 className="w-4 h-4" /> Đã tham gia ({tripsData.participated.length})
                            </button>
                        </div>

                        {/* DANH SÁCH DỮ LIỆU */}
                        <div className="p-6 relative flex-1 overflow-y-auto bg-slate-50/50">
                            {isTripsLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                    <p className="text-sm font-medium text-slate-500">Đang đồng bộ dữ liệu...</p>
                                </div>
                            ) : currentTripsList.length > 0 ? (
                                <div className="space-y-3">
                                    {currentTripsList.map((trip) => (
                                        <div key={trip.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center gap-4 hover:border-blue-200 transition-colors">
                                            <div>
                                                <p className="font-bold text-slate-800 text-base">{trip.destination}</p>
                                                <div className="flex gap-4 mt-1">
                                                    <p className="text-xs text-slate-500 font-medium">Khởi hành: <span className="text-slate-700">{trip.startDate ? new Date(trip.startDate).toLocaleDateString('vi-VN') : 'N/A'}</span></p>
                                                    <p className="text-xs text-slate-500 font-medium">Kết thúc: <span className="text-slate-700">{trip.endDate ? new Date(trip.endDate).toLocaleDateString('vi-VN') : 'N/A'}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${['completed', 'COMPLETED', 'APPROVED'].includes(trip.status) ? 'bg-emerald-100 text-emerald-700' : ['upcoming', 'UPCOMING'].includes(trip.status) ? 'bg-blue-100 text-blue-700' : ['ongoing', 'ONGOING'].includes(trip.status) ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                                                    {trip.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                        <MapIcon className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-medium">
                                        Không có chuyến đi nào trong mục này.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL XEM CHI TIẾT (HỒ SƠ) */}
            {selectedUserDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                Hồ sơ Người dùng
                            </h3>
                            <button onClick={() => setSelectedUserDetails(null)} className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-full transition">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                                <img
                                    src={selectedUserDetails.avatar_url || `https://ui-avatars.com/api/?name=${(selectedUserDetails.full_name || selectedUserDetails.email || 'User').replace(/\s+/g, '+')}&background=random`}
                                    className="w-16 h-16 rounded-full object-cover border border-slate-200"
                                    alt="avatar"
                                    onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${(selectedUserDetails.full_name || selectedUserDetails.email || 'User').replace(/\s+/g, '+')}&background=random`)}
                                />
                                <div>
                                    <h4 className="text-xl font-bold text-slate-800">{selectedUserDetails.fullName || "Chưa cập nhật tên"}</h4>
                                    <p className="text-sm text-slate-500">{selectedUserDetails.email}</p>
                                    <p className="text-xs text-slate-400 mt-1 font-mono">ID: {selectedUserDetails.id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 mb-1">Điểm uy tín</p>
                                    <p className="text-lg font-black text-slate-700 flex items-center gap-1">
                                        <Star className="w-4 h-4 text-amber-400" fill="currentColor" /> {selectedUserDetails.trust_score ?? 100}
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 mb-1">Chuyến đi đã tạo</p>
                                    <p className="text-lg font-black text-slate-700">{selectedUserDetails.tripsCreated ?? 0}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                                    <p className="text-xs text-slate-500 mb-1">Ngày tham gia hệ thống</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {(selectedUserDetails.createdAt || selectedUserDetails.created_at) ? new Date(selectedUserDetails.createdAt || selectedUserDetails.created_at as string).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Không xác định'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 border-t border-slate-100 pt-4">
                                <h4 className="text-sm font-bold text-slate-700 mb-3">Lịch sử bị tố cáo</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                    {allReports
                                        .filter(r => r.reported_id === selectedUserDetails.id)
                                        .map(report => (
                                            <div key={report.id} className="p-3 bg-rose-50 rounded border border-rose-100 text-xs">
                                                <p className="font-bold text-rose-600">{report.reason}</p>
                                                <p className="text-slate-600 mt-1">{report.description}</p>
                                            </div>
                                        ))
                                    }
                                    {allReports.filter(r => r.reported_id === selectedUserDetails.id).length === 0 && (
                                        <p className="text-xs text-slate-400 italic">Không có báo cáo nào.</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}