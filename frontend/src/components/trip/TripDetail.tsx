"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Calendar, DollarSign, Users, Navigation, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TripActionPanel from "./TripActionPanel";
import { getStoredAuthUser } from "@/services/auth";
import type { TripRelation } from "@/services/trips";

type Companion = {
    key: string;
    userId: string;
    name: string;
    avatarUrl: string | null;
    role: "LEADER" | "MEMBER";
};

function getInitial(name: string) {
    return name.trim().charAt(0).toUpperCase() || "T";
}

function getCompanions(tripData: any): Companion[] {
    const rawMembers = Array.isArray(tripData.members) ? tripData.members : [];
    const companions = new Map<string, Companion>();
    const leaderId = tripData.leader?.id || tripData.leaderId;
    const leaderName = tripData.leader?.name || tripData.leader?.fullName || tripData.leader?.full_name || "Leader";
    const leaderAvatar = tripData.leader?.avatar || tripData.leader?.avatarUrl || tripData.leader?.avatar_url || null;

    if (leaderId) {
        companions.set(leaderId, {
            key: `leader-${leaderId}`,
            userId: leaderId,
            name: leaderName,
            avatarUrl: leaderAvatar,
            role: "LEADER",
        });
    }

    rawMembers.forEach((member: any) => {
        const user = member.user ?? member;
        const userId = user.id || member.userId || member.user_id;
        if (!userId) return;

        const name =
            user.fullName ||
            user.full_name ||
            user.name ||
            member.name ||
            member.fullName ||
            member.full_name ||
            "Thành viên TripConnect";
        const avatarUrl =
            user.avatarUrl ||
            user.avatar_url ||
            user.avatar ||
            member.avatarUrl ||
            member.avatar_url ||
            null;
        const role = member.role === "LEADER" || userId === leaderId ? "LEADER" : "MEMBER";

        const current = companions.get(userId);
        companions.set(userId, {
            key: member.id || current?.key || userId,
            userId,
            name,
            avatarUrl,
            role: current?.role === "LEADER" ? "LEADER" : role,
        });
    });

    return Array.from(companions.values()).sort((left, right) => {
        if (left.role === right.role) return 0;
        return left.role === "LEADER" ? -1 : 1;
    });
}

export default function TripDetail({ tripData, relation, onChanged }: { tripId: string, tripData: any, relation?: TripRelation | null, onChanged?: () => void }) {
    const currentUser = getStoredAuthUser();
    const isLeader = relation?.isLeader ?? currentUser?.id === tripData.leaderId;
    const isMember = relation?.isMember ?? false;
    const companions = getCompanions(tripData);

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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm min-h-[90px]">
                            {companions.map((member) => (
                                <Link
                                    key={member.key}
                                    href={`/profile/${member.userId}`}
                                    className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition-all hover:border-orange-200 hover:bg-orange-50"
                                    title={member.name}
                                >
                                    <Avatar className={`h-12 w-12 shrink-0 border-2 shadow-sm ring-2 ring-transparent transition-all ${member.role === "LEADER" ? "border-amber-400 group-hover:ring-amber-300" : "border-white group-hover:ring-orange-300"}`}>
                                        <AvatarImage src={member.avatarUrl || ""} />
                                        <AvatarFallback className={`font-bold ${member.role === "LEADER" ? "bg-amber-100 text-amber-700" : "bg-orange-100 text-orange-600"}`}>
                                            {getInitial(member.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-slate-800 group-hover:text-orange-700">
                                            {member.name}
                                        </p>
                                        <p className={`text-xs font-semibold ${member.role === "LEADER" ? "text-amber-600" : "text-slate-500"}`}>
                                            {member.role === "LEADER" ? "Leader" : "Thành viên"}
                                        </p>
                                    </div>
                                </Link>
                            ))}
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
