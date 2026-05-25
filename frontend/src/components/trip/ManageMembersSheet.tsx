"use client";

import React, { useState, useEffect } from "react";
import { Star, UserMinus, ShieldAlert, Users, Loader2 } from "lucide-react";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import KickMemberAction from "./KickMemberAction";

// GIẢ LẬP DỮ LIỆU
const MOCK_MEMBERS = [
    { id: "m1", name: "Đình Thạch", trustScore: 4.9, avatar: "ĐT", role: "LEADER" },
    { id: "m2", name: "Trần Thị Bích", trustScore: 3.5, avatar: "TB", role: "MEMBER" },
    { id: "m3", name: "Lê Văn Cường", trustScore: 4.2, avatar: "LC", role: "MEMBER" },
];

export default function ManageMembersSheet({ tripId, isLeader = false, children }: { tripId: string, isLeader?: boolean, children: React.ReactNode }) {
    const [members, setMembers] = useState(MOCK_MEMBERS);
    const [isLoading, setIsLoading] = useState(false);

    /* ==========================================
       CHUẨN BỊ CHO BACKEND: FETCH DANH SÁCH THÀNH VIÊN
    ========================================== */
    useEffect(() => {
        // Hàm này sẽ tự động chạy mỗi khi Leader bấm mở Sheet của chuyến đi này
        const fetchMembers = async () => {
            // setIsLoading(true);
            // try {
            //   const response = await fetch(`/api/trips/${tripId}/members`);
            //   const data = await response.json();
            //   setMembers(data);
            // } catch (error) {
            //   console.error("Lỗi fetch thành viên", error);
            // } finally {
            //   setIsLoading(false);
            // }
        };
        fetchMembers();
    }, [tripId]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>

            <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50">
                <SheetHeader className="mb-6 mt-4">
                    <SheetTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Thành viên đoàn ({members.length})
                    </SheetTitle>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3.5 border border-slate-200/60 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all">

                                <div className="flex items-center gap-3.5">
                                    <Avatar className="h-11 w-11">
                                        <AvatarFallback className={`${member.role === 'LEADER' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'} font-bold`}>
                                            {member.avatar}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                                            {member.role === "LEADER" && (
                                                <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <ShieldAlert className="h-3 w-3" /> LEADER
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 mt-1">
                                            <Star className="h-3.5 w-3.5 fill-amber-500" />
                                            <span>{member.trustScore}</span>
                                            <span className="text-slate-400 font-medium">Trust Score</span>
                                        </div>
                                    </div>
                                </div>

                                {isLeader && member.role !== "LEADER" && (
                                    <KickMemberAction
                                        tripId={tripId}
                                        memberId={member.id}
                                        memberName={member.name}
                                        onSuccess={() => setMembers(prev => prev.filter(m => m.id !== member.id))}
                                    >
                                        <Button variant="outline" size="icon" title="Xóa khỏi nhóm" className="h-9 w-9 rounded-full text-red-500 border-red-100 bg-red-50 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm">
                                            <UserMinus className="h-4 w-4" />
                                        </Button>
                                    </KickMemberAction>
                                )}

                            </div>
                        ))}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}