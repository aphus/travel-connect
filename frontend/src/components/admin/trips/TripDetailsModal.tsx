import React from "react";
import { X, MapPin, Calendar, Users, DollarSign, AlignLeft, Shield, User } from "lucide-react";
import { AdminTrip, getAdminTripDestinationLabel } from "@/services/admin";

interface TripDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    trip: AdminTrip | null;
}

export default function TripDetailsModal({ isOpen, onClose, trip }: TripDetailsModalProps) {
    if (!isOpen || !trip) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* HEADER */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 line-clamp-1">{getAdminTripDestinationLabel(trip) || "Chuyến đi chưa có tên"}</h3>
                            <p className="text-xs text-slate-500 font-mono">ID: {trip.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30 space-y-6">

                    {/* Thông tin chung */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <AlignLeft className="w-4 h-4 text-blue-500" /> Thông tin chung
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-500">Thời gian</p>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {trip.startDate ? new Date(trip.startDate).toLocaleDateString('vi-VN') : 'N/A'}
                                        {trip.endDate ? ` - ${new Date(trip.endDate).toLocaleDateString('vi-VN')}` : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <DollarSign className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-500">Chi phí dự kiến</p>
                                    <p className="text-sm font-semibold text-emerald-600">{trip.cost ? trip.cost.toLocaleString('vi-VN') + ' VNĐ' : 'Thỏa thuận'}</p>
                                </div>
                            </div>
                            <div className="md:col-span-2 mt-2">
                                <p className="text-xs text-slate-500 mb-1">Mô tả chuyến đi:</p>
                                <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 italic border border-slate-100">
                                    {trip.description || "Không có mô tả cho chuyến đi này."}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danh sách thành viên */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" /> Thành viên tham gia ({trip.members?.length || 0})
                        </h4>

                        {trip.members && trip.members.length > 0 ? (
                            <div className="space-y-3">
                                {trip.members.map((member) => {
                                    const isLeader = member.role === 'LEADER' || member.user?.id === trip.leaderId;

                                    return (
                                        <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 uppercase font-bold text-sm">
                                                    {member.user?.full_name?.charAt(0) || <User className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {member.user?.full_name || member.user?.email || "Người dùng ẩn"}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-mono">User ID: {member.user?.id?.substring(0, 8)}...</p>
                                                </div>
                                            </div>

                                            {/* Badge Role */}
                                            {isLeader ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100">
                                                    <Shield className="w-3 h-3" /> Trưởng nhóm
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                                                    <User className="w-3 h-3" /> Thành viên
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                Chưa có thành viên nào tham gia chuyến đi này.
                            </p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
