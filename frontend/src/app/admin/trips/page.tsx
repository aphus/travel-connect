"use client";

import React, { useState, useEffect } from "react";
import { Search, Map, AlertOctagon, Trash2, CheckCircle2, Eye, Loader2 } from "lucide-react";
import {
    cancelTripAsAdmin,
    getAdminTripDestinationLabel,
    getAllTrips,
    type AdminTrip,
} from "@/services/admin";
import TripDetailsModal from "@/components/admin/trips/TripDetailsModal";

export default function AdminTripsPage() {
    const [trips, setTrips] = useState<AdminTrip[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<AdminTrip | null>(null);

    async function loadTrips() {
        await Promise.resolve();

        try {
            setIsLoading(true);
            const data = await getAllTrips();
            setTrips(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi khi tải danh sách chuyến đi:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadTrips();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

    const handleCancelTrip = async (tripId: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn HỦY chuyến đi này? Hành động này không thể hoàn tác!")) {
            return;
        }
        try {
            setActionLoadingId(tripId);
            await cancelTripAsAdmin(tripId);
            setTrips(trips.map(trip =>
                trip.id === tripId ? { ...trip, status: "cancelled" } : trip
            ));
        } catch (error) {
            console.error("Lỗi khi hủy chuyến đi:", error);
            alert("Hủy chuyến đi thất bại. Vui lòng thử lại!");
        } finally {
            setActionLoadingId(null);
        }
    };

    const filteredTrips = trips.filter(trip =>
        getAdminTripDestinationLabel(trip).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý Chuyến đi</h2>
                    <p className="text-slate-500 mt-1">Theo dõi, kiểm duyệt và xử lý các chuyến đi vi phạm.</p>
                </div>

                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo điểm đến..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] relative">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                        <p className="text-sm text-slate-500 font-medium">Đang tải dữ liệu chuyến đi...</p>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Chuyến đi</th>
                                <th className="px-6 py-4">Ngày khởi hành</th>
                                <th className="px-6 py-4">Số Report</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTrips.map((trip) => (
                                <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                <Map className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 line-clamp-1">{getAdminTripDestinationLabel(trip)}</p>

                                                <p className="text-slate-500 text-xs mt-0.5">Leader ID: <span className="font-medium text-slate-700">{trip.leaderId ? trip.leaderId.substring(0, 8) + '...' : 'N/A'}</span></p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">
                                        {trip.startDate ? new Date(trip.startDate).toLocaleDateString('vi-VN') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {(trip.reportCount || 0) > 10 ? (
                                            <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-md text-xs">
                                                <AlertOctagon className="w-3.5 h-3.5" /> {trip.reportCount}
                                            </span>
                                        ) : (trip.reportCount || 0) > 0 ? (
                                            <span className="inline-flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md text-xs">
                                                {trip.reportCount}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 font-medium">0</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {trip.status === 'active' || trip.status === 'upcoming' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> {trip.status === 'upcoming' ? 'Sắp đi' : 'Hợp lệ'}
                                            </span>
                                        ) : trip.status === 'reported' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-200">
                                                <AlertOctagon className="w-3.5 h-3.5" /> Bị Report
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">
                                                <Trash2 className="w-3.5 h-3.5" /> Đã Hủy
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedTrip(trip);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {trip.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => handleCancelTrip(trip.id)}
                                                    disabled={actionLoadingId === trip.id}
                                                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Hủy chuyến đi này"
                                                >
                                                    {actionLoadingId === trip.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!isLoading && filteredTrips.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        Không tìm thấy chuyến đi nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <TripDetailsModal
                        isOpen={isViewModalOpen}
                        onClose={() => setIsViewModalOpen(false)}
                        trip={selectedTrip}
                    />
                </div>
            </div>
        </div>
    );
}
