import React, { useState } from "react";
import { AlertTriangle, X, Clock, CheckCircle2, User, MapPin, ShieldAlert, Ban, Send, Check } from "lucide-react";
import { AdminReport } from "@/services/admin";
import { fetchWrapper } from "@/services/fetchWrapper";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportsList: AdminReport[];
}

const REASON_MAP: Record<string, string> = {
    SPAM: "Spam, quảng cáo trái phép",
    SCAM: "Có dấu hiệu lừa đảo, chiếm đoạt",
    HARASSMENT: "Quấy rối, chửi bới, xúc phạm",
    NO_SHOW: "Hủy chuyến không báo / Không xuất hiện",
    OTHER: "Lý do khác"
};

export default function ReportModal({ isOpen, onClose, reportsList }: ReportModalProps) {
    const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const pendingReports = reportsList.filter(r => r.status !== 'RESOLVED');

    const handleAction = async (actionType: 'BAN' | 'WARN' | 'IGNORE') => {
        if (!selectedReport) return;
        setIsProcessing(true);

        try {
            if (actionType === 'BAN') {
                await fetchWrapper(`/admin/users/${selectedReport.reported_id}/ban`, { method: "PATCH" });
                alert(`Đã KHÓA tài khoản của ${selectedReport.reported?.full_name || 'người dùng này'}.`);
            }
            else if (actionType === 'WARN') {
                alert(`Đã gửi cảnh cáo tới ${selectedReport.reported?.full_name || 'người dùng này'}.`);
            }

            await fetchWrapper(`/reports/${selectedReport.id}/resolve`, {
                method: "PATCH",
                body: JSON.stringify({ status: "RESOLVED", admin_note: actionType })
            });

            setSelectedReport(null);
            alert("Xử lý thành công! F5 lại trang để cập nhật danh sách.");
            onClose();

        } catch (error) {
            console.error("Lỗi khi xử lý:", error);
            alert("Có lỗi xảy ra khi xử lý. Vui lòng thử lại!");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            {/* --- MODAL 1: DANH SÁCH BÁO CÁO --- */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-500" />
                            <h3 className="text-lg font-bold text-slate-800">Danh sách Báo cáo vi phạm</h3>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
                        {pendingReports.length > 0 ? (
                            <div className="space-y-4">
                                {pendingReports.map((report) => {
                                    const reportedName = report.reported?.full_name || report.reported?.email || "N/A";
                                    const tripDest = report.trip?.destination || "N/A";
                                    const reportDate = report.created_at;
                                    const reasonText = REASON_MAP[report.reason] || report.reason;

                                    return (
                                        <div key={report.id} className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md">
                                            <div className="flex justify-between items-start">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md bg-rose-50 text-rose-700">
                                                    <User className="w-3.5 h-3.5" /> Tố cáo Thành viên
                                                </span>
                                                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {reportDate ? new Date(reportDate).toLocaleDateString('vi-VN') : 'Gần đây'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                                                <div>
                                                    <p className="text-xs text-slate-500">Người bị tố cáo:</p>
                                                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{reportedName}</p>
                                                    <p className="text-xs font-mono text-slate-400 mt-0.5">ID: {report.reported_id?.substring(0, 8)}...</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Từ chuyến đi:</p>
                                                    <p className="text-sm font-bold text-slate-800 line-clamp-1 flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5 text-blue-500" /> {tripDest}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm text-slate-800 font-bold mt-1">Lý do: <span className="text-rose-600 font-medium">{reasonText}</span></p>
                                                {report.description && (
                                                    <p className="text-sm text-slate-600 mt-1 italic">"{report.description}"</p>
                                                )}
                                            </div>

                                            <div className="flex justify-end pt-2 border-t border-slate-50">
                                                <button
                                                    onClick={() => setSelectedReport(report)}
                                                    className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    Xử lý ngay &rarr;
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
                                <p className="font-medium text-slate-600">Tuyệt vời! Không có báo cáo vi phạm nào.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MODAL 2: XỬ LÝ (ACTION POPUP) --- */}
            {selectedReport && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-rose-500" /> Quyết định Xử lý
                            </h3>
                            <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="text-sm text-slate-600">
                                Bạn đang xử lý thành viên <span className="font-bold text-slate-900">{selectedReport.reported?.full_name || selectedReport.reported?.email}</span>. Hãy chọn một hành động bên dưới:
                            </div>

                            <div className="space-y-3 mt-4">
                                <button
                                    onClick={() => handleAction('WARN')}
                                    disabled={isProcessing}
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 font-bold text-sm">
                                        <Send className="w-5 h-5" /> Gửi thông báo Cảnh cáo
                                    </div>
                                    <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Chọn</span>
                                </button>

                                <button
                                    onClick={() => handleAction('BAN')}
                                    disabled={isProcessing}
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 font-bold text-sm">
                                        <Ban className="w-5 h-5" /> Khóa tài khoản vĩnh viễn
                                    </div>
                                    <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Chọn</span>
                                </button>

                                <button
                                    onClick={() => handleAction('IGNORE')}
                                    disabled={isProcessing}
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 font-bold text-sm">
                                        <Check className="w-5 h-5 text-emerald-500" /> Bỏ qua & Đánh dấu đã xử lý
                                    </div>
                                    <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Chọn</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}