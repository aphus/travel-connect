"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Clock, CheckCircle2, User, MapPin, ShieldAlert, Ban, Send, Check, Loader2 } from "lucide-react";
import { getAllReports, AdminReport } from "@/services/admin";
import { fetchWrapper } from "@/services/fetchWrapper";

const REASON_MAP: Record<string, string> = {
    SPAM: "Spam, quảng cáo trái phép",
    SCAM: "Có dấu hiệu lừa đảo, chiếm đoạt",
    HARASSMENT: "Quấy rối, chửi bới, xúc phạm",
    NO_SHOW: "Hủy chuyến không báo / Không xuất hiện",
    OTHER: "Lý do khác"
};

export default function AdminReportsPage() {
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const loadReports = async () => {
        try {
            setIsLoading(true);
            const data = await getAllReports();
            setReports(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi tải báo cáo:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const pendingReports = reports.filter(r => r.status !== 'resolved');

    const handleAction = async (actionType: 'BAN' | 'WARN' | 'IGNORE', banDays?: number) => {
        if (!selectedReport) return;
        setIsProcessing(true);

        if (actionType === 'BAN') {
            const url = banDays
                ? `/admin/users/${selectedReport.reported_id}/ban?days=${banDays}`
                : `/admin/users/${selectedReport.reported_id}/ban`;

            await fetchWrapper(url, {
                method: "PATCH"
            });
            alert(`Đã KHÓA tài khoản của ${selectedReport.reported?.full_name || 'người dùng'} ${banDays ? `(Trong ${banDays} ngày)` : '(Vĩnh viễn)'}.`);
        }
        else if (actionType === 'WARN') {
            alert(`Đã gửi cảnh cáo tới ${selectedReport.reported?.full_name || 'người dùng'}.`);
        }

        await fetchWrapper(`/reports/${selectedReport.id}/resolve`, {
            method: "PATCH",
            body: JSON.stringify({ status: "resolved", admin_note: actionType })
        });

        setSelectedReport(null);
        loadReports();
        setIsProcessing(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-rose-500" /> Quản lý Báo cáo
                </h2>
                <p className="text-slate-500 mt-1">Kiểm duyệt và xử lý các hành vi vi phạm từ người dùng.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : pendingReports.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        {pendingReports.map((report) => {
                            const reportedName = report.reported?.full_name || report.reported?.email || "N/A";
                            const tripDest = report.trip?.destination || "N/A";
                            const reportDate = report.created_at || report.createdAt;
                            const reasonText = REASON_MAP[report.reason] || report.reason;

                            return (
                                <div key={report.id} className="bg-slate-50 p-5 rounded-xl border border-rose-100 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md hover:border-rose-200">
                                    <div className="flex justify-between items-start">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md bg-rose-100 text-rose-700">
                                            <User className="w-4 h-4" /> Tố cáo Thành viên
                                        </span>
                                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {reportDate ? new Date(reportDate).toLocaleDateString('vi-VN') : 'Gần đây'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-slate-100">
                                        {/* CỘT 1: THÔNG TIN NGƯỜI BỊ TỐ CÁO & TIỀN SỰ */}
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Người bị tố cáo:</p>
                                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{reportedName}</p>
                                            <p className="text-xs font-mono text-slate-400 mt-0.5 mb-2">ID: {report.reported_id?.substring(0, 8)}...</p>

                                            <div className="flex flex-col gap-1 mt-2">
                                                {report.previousReportCount !== undefined && report.previousReportCount > 0 ? (
                                                    <span className="inline-flex max-w-fit items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                                        <AlertTriangle className="w-3 h-3" /> Bị tố cáo {report.previousReportCount} lần trước đây
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex max-w-fit items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 className="w-3 h-3" /> Lần đầu bị tố cáo
                                                    </span>
                                                )}

                                                {report.accountStatus && (
                                                    <span className="inline-flex max-w-fit items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                        Trạng thái thẻ: {report.accountStatus.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* CỘT 2: THÔNG TIN CHUYẾN ĐI */}
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Từ chuyến đi:</p>
                                            <p className="text-sm font-bold text-slate-800 line-clamp-1 flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-blue-500" /> {tripDest}
                                            </p>
                                        </div>
                                    </div>

                                    {/* CHI TIẾT LÝ DO TỐ CÁO */}
                                    <div>
                                        <p className="text-sm text-slate-800 font-bold">Lý do: <span className="text-rose-600 font-medium">{reasonText}</span></p>
                                        {report.description && (
                                            <p className="text-sm text-slate-600 mt-2 p-3 bg-white rounded-lg italic border border-slate-100">"{report.description}"</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end mt-auto pt-2">
                                        <button
                                            onClick={() => setSelectedReport(report)}
                                            className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                                        >
                                            Xử lý vi phạm
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                        <p className="font-medium text-slate-600 text-lg">Tuyệt vời! Không có báo cáo vi phạm nào chờ xử lý.</p>
                    </div>
                )}
            </div>

            {/* --- MODAL XỬ LÝ (ACTION POPUP) --- */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-rose-500" /> Quyết định Xử lý
                            </h3>
                            <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition">
                                X
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                Đang xử lý thành viên <span className="font-bold text-slate-900 text-base">{selectedReport.reported?.full_name || selectedReport.reported?.email}</span>. Chọn hành động:
                            </div>

                            <div className="space-y-3 mt-4">
                                <button
                                    onClick={() => handleAction('WARN')}
                                    disabled={isProcessing}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-3 font-bold text-sm">
                                        <Send className="w-5 h-5" /> Gửi thông báo Cảnh cáo
                                    </div>
                                </button>

                                <div className="space-y-2 border border-rose-200 bg-rose-50 p-4 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3 font-bold text-sm text-rose-700 mb-2">
                                        <Ban className="w-5 h-5" /> Khóa tài khoản
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => handleAction('BAN', 3)}
                                            disabled={isProcessing}
                                            className="py-2 text-xs font-bold rounded-lg border border-rose-300 bg-white hover:bg-rose-100 text-rose-600 transition-all"
                                        >
                                            3 Ngày
                                        </button>
                                        <button
                                            onClick={() => handleAction('BAN', 7)}
                                            disabled={isProcessing}
                                            className="py-2 text-xs font-bold rounded-lg border border-rose-300 bg-white hover:bg-rose-100 text-rose-600 transition-all"
                                        >
                                            7 Ngày
                                        </button>
                                        <button
                                            onClick={() => handleAction('BAN')}
                                            disabled={isProcessing}
                                            className="py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm"
                                        >
                                            Vĩnh viễn
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleAction('IGNORE')}
                                    disabled={isProcessing}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-3 font-bold text-sm">
                                        <Check className="w-5 h-5 text-emerald-500" /> Bỏ qua & Đánh dấu đã xử lý
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}