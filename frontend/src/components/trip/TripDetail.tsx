"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, Users, Navigation, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TripActionPanel from "./TripActionPanel";
import { getStoredAuthUser } from "@/services/auth";
import { getAccessToken } from "@/services/fetchWrapper";
import type { TripRelation } from "@/services/trips";

export default function TripDetail({ tripId, tripData, relation, onChanged }: { tripId: string, tripData: any, relation?: TripRelation | null, onChanged?: () => void }) {
    const router = useRouter();
    const currentUser = getStoredAuthUser();
    const isLeader = relation?.isLeader ?? currentUser?.id === tripData.leaderId;
    const isMember = relation?.isMember ?? false;

    const [members, setMembers] = useState<any[]>([]);

    useEffect(() => {
        if (isLeader || isMember) {
            const token = getAccessToken();
            fetch(`http://localhost:8000/api/trips/${tripId}/members`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setMembers(data);
                })
                .catch(err => console.error("Lỗi lấy danh sách thành viên:", err));
        }
    }, [tripId, isLeader, isMember]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card className="p-8 rounded-3xl border-none shadow-sm bg-white">

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition-transform hover:-translate-y-1">
                            <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                                <Calendar className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Thời gian</p>
                                <p className="font-semibold text-slate-800 text-sm">{tripData.startDate} <br /> {tripData.endDate}</p>
                            </div>
                        </div>

                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition-transform hover:-translate-y-1">
                            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full">
                                <DollarSign className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ngân sách</p>
                                <p className="font-semibold text-slate-800 text-sm">{tripData.budget}</p>
                            </div>
                        </div>

                        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition-transform hover:-translate-y-1">
                            <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
                                <Users className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Thành viên</p>
                                <p className="font-semibold text-slate-800 text-sm">{tripData.currentMembers} / {tripData.maxMembers} người</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                            <Navigation className="text-blue-600 w-6 h-6" /> Mô tả lịch trình
                        </h2>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <p className="whitespace-pre-line text-slate-600 leading-relaxed">
                                {tripData.description}
                            </p>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                            <Users className="text-orange-500 w-6 h-6" /> Những người bạn đồng hành
                        </h2>
                        <div className="flex flex-wrap gap-5 items-center bg-white border border-slate-200 p-5 rounded-2xl shadow-sm min-h-[90px]">
                            {(isLeader || isMember) ? (
                                members.length > 0 ? (
                                    members.map((member) => (
                                        <div
                                            key={member.id}
                                            onClick={() => router.push(`/profile/${member.userId}`)}
                                            className="flex flex-col items-center gap-1.5 cursor-pointer group"
                                            title={member.name}
                                        >
                                            <Avatar className={`h-12 w-12 border-2 shadow-sm ring-2 ring-transparent transition-all ${member.role === 'leader' ? 'border-amber-400 group-hover:ring-amber-300' : 'border-white group-hover:ring-orange-400'}`}>
                                                <AvatarImage src={member.avatarUrl || ""} />
                                                <AvatarFallback className="font-bold bg-orange-100 text-orange-600">
                                                    {member.name?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-[11px] font-semibold text-slate-500 group-hover:text-orange-600 truncate max-w-[65px] text-center">
                                                {member.name.split(' ').pop()}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-sm text-slate-500 font-medium">Đang tải danh sách...</span>
                                )
                            ) : (
                                <>
                                    <div
                                        className="flex flex-col items-center gap-1.5 cursor-pointer group"
                                        onClick={() => router.push(`/profile/${tripData.leaderId}`)}
                                    >
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-2 ring-amber-400 group-hover:ring-amber-500 transition-all">
                                            <AvatarImage src={tripData.leader?.avatar_url || ""} />
                                            <AvatarFallback className="font-bold bg-amber-100 text-amber-600">L</AvatarFallback>
                                        </Avatar>
                                        <span className="text-[11px] font-bold text-amber-600 truncate max-w-[65px] text-center">
                                            Leader
                                        </span>
                                    </div>

                                    {Array.from({ length: Math.max(0, tripData.currentMembers - 1) }).map((_, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1.5">
                                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-2 ring-slate-100">
                                                <AvatarFallback className="font-bold bg-slate-100 text-slate-500">
                                                    M{i + 1}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-[11px] font-medium text-slate-400">Ẩn danh</span>
                                        </div>
                                    ))}
                                </>
                            )}

                            {(tripData.maxMembers - tripData.currentMembers) > 0 && (
                                <div className="h-12 w-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 text-slate-400 font-bold text-xs ml-2">
                                    +{tripData.maxMembers - tripData.currentMembers}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                            <ShieldAlert className="text-rose-500 w-6 h-6" /> Nội quy cần lưu ý
                        </h2>
                        <ul className="space-y-4 bg-rose-50/50 p-6 rounded-2xl border border-rose-100 text-slate-700 font-medium">
                            <li className="flex gap-3 items-start">
                                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                <span>Luôn tôn trọng, hòa đồng với các thành viên trong nhóm và tuân theo sự dẫn dắt của Leader.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                <span>Tuân thủ nghiêm ngặt thời gian và lịch trình di chuyển đã được cả nhóm thống nhất từ trước.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                <span>Các chi phí phát sinh chung trong chuyến đi sẽ được ghi chép và chia đều minh bạch.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                <span>Vui lòng báo trước ít nhất 48h nếu bạn có việc đột xuất và muốn hủy tham gia chuyến đi.</span>
                            </li>
                        </ul>
                    </div>

                </Card>
            </div>

            <div className="lg:col-span-1">
                <TripActionPanel
                    trip={tripData}
                    isLeader={isLeader}
                    isMember={isMember}
                    joinStatus={relation?.joinStatus ?? null}
                    onChanged={onChanged}
                />
            </div>
        </div>
    );
}