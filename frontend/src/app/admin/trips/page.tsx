"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Bell,
  Loader2,
  Map,
  Calendar,
  Filter,
  Navigation,
  CheckCircle2,
  Tent,
} from "lucide-react";
import {
  getAllTrips,
  sendTripNotificationAsAdmin,
  type AdminTrip,
} from "@/services/admin";
import TripDetailsModal from "@/components/admin/trips/TripDetailsModal";
import SendNotificationModal from "@/components/admin/trips/SendNotificationModal";

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<AdminTrip | null>(null);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);

  const handleExecuteSendNotification = async (payload: {
    type: string;
    message: string;
    broadcastToMembers: boolean;
  }) => {
    if (!selectedTrip) return;

    try {
      const response = await sendTripNotificationAsAdmin(
        selectedTrip.id,
        payload,
      );
      alert(response.message || "Đã gửi thông báo thành công!");
      setIsNotifyModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi gửi thông báo:", error);
      alert("Gửi thông báo thất bại. Vui lòng kiểm tra lại!");
    }
  };

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const data = await getAllTrips();
      setTrips(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchTrips();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  // Lọc dữ liệu kết hợp Tìm kiếm & Trạng thái
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = (trip.destination || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "ALL" || trip.status === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Tính toán số liệu cho phần Thống kê
  const stats = {
    total: trips.length,
    ongoing: trips.filter((t) => t.status === "ongoing").length,
    completed: trips.filter((t) => t.status === "completed").length,
  };

  return (
      <div className="p-6 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Quản lý Chuyến đi
            </h1>
            <p className="text-slate-500 mt-1.5 font-medium">
              Theo dõi tiến độ, tỉ lệ lấp đầy và hỗ trợ điều phối viên.
            </p>
          </div>
        </div>

        {/* --- THẺ THỐNG KÊ (STAT CARDS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Tent className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Tổng Chuyến đi
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-100 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Đang diễn ra
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {stats.ongoing}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Đã hoàn thành
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- BỘ LỌC VÀ TÌM KIẾM --- */}
        <div className="flex flex-col sm:flex-row gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm điểm đến..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="relative w-full sm:w-64 flex items-center">
            <div className="absolute left-4 z-10 flex items-center justify-center pointer-events-none">
              <Filter className="w-4 h-4 text-slate-400" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm appearance-none cursor-pointer"
            >
              <option value="ALL">Tất cả Trạng thái</option>
              <option value="UPCOMING">Sắp diễn ra</option>
              <option value="ONGOING">Đang diễn ra</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* --- BẢNG DỮ LIỆU --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
              <p className="font-semibold text-slate-600 animate-pulse">
                Đang đồng bộ dữ liệu...
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[11px] tracking-widest border-b border-slate-200">
                <tr>
                  <th className="px-6 py-5">Hành trình</th>
                  <th className="px-6 py-5">Khởi hành</th>
                  <th className="px-6 py-5">Độ lấp đầy</th>
                  <th className="px-6 py-5 text-center">Trạng thái</th>
                  <th className="px-6 py-5 text-right">Điều phối</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrips.length > 0 ? (
                  filteredTrips.map((trip) => {
                    const members = trip.members?.length || 0;
                    const max = trip.maxMembers || 1;
                    const fillPercent = Math.min(
                      Math.round((members / max) * 100),
                      100,
                    );

                    return (
                      <tr
                        key={trip.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
                              <Map className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 text-base">
                                {trip.destination}
                              </span>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">
                                ID: {trip.id.substring(0, 8)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {new Date(trip.startDate).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="w-full max-w-[140px]">
                            <div className="flex justify-between items-end mb-1.5">
                              <span className="text-xs font-bold text-slate-700">
                                {members} / {max}{" "}
                                <span className="text-slate-400 font-medium">
                                  người
                                </span>
                              </span>
                              <span className="text-[10px] font-black text-slate-400">
                                {fillPercent}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${fillPercent >= 100 ? "bg-emerald-500" : fillPercent >= 50 ? "bg-blue-500" : "bg-amber-400"}`}
                                style={{ width: `${fillPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wide border ${
                              trip.status === "completed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : trip.status === "ongoing"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : trip.status === "upcoming"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {trip.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedTrip(trip);
                                setIsViewModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-all"
                              title="Xem hồ sơ chuyến đi"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                // Log thử để kiểm tra khi click
                                console.log("Status clicked:", trip.status);

                                // So sánh bằng cách chuyển về chữ thường
                                const statusLower = trip.status
                                  ? trip.status.toLowerCase()
                                  : "";
                                if (
                                  ["completed", "cancelled"].includes(
                                    statusLower,
                                  )
                                ) {
                                  alert(
                                    "Chuyến đi đã kết thúc hoặc bị hủy, không thể gửi thông báo.",
                                  );
                                  return;
                                }
                                setSelectedTrip(trip);
                                setIsNotifyModalOpen(true);
                              }}
                              disabled={["completed", "cancelled"].includes(
                                trip.status ? trip.status.toLowerCase() : "",
                              )}
                              className={`p-2 transition-all rounded-lg ${
                                ["completed", "cancelled"].includes(
                                  trip.status ? trip.status.toLowerCase() : "",
                                )
                                  ? "text-slate-300 cursor-not-allowed opacity-50"
                                  : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                              }`}
                              title={
                                ["completed", "cancelled"].includes(
                                  trip.status ? trip.status.toLowerCase() : "",
                                )
                                  ? "Không thể gửi thông báo"
                                  : "Thông báo cho Leader"
                              }
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <Map className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="font-semibold text-slate-500">
                          Không tìm thấy chuyến đi nào
                        </p>
                        <p className="text-sm mt-1">
                          Thử thay đổi từ khóa hoặc bộ lọc trạng thái xem sao.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <TripDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          trip={selectedTrip}
        />

        <SendNotificationModal
          isOpen={isNotifyModalOpen}
          onClose={() => setIsNotifyModalOpen(false)}
          trip={selectedTrip}
          onSend={handleExecuteSendNotification}
        />
      </div>
    );
}
