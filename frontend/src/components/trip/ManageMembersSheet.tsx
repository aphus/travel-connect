"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { UserMinus, ShieldAlert, Users, Loader2 } from "lucide-react";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import KickMemberAction from "./KickMemberAction";
import { getTripMembers, type TripMember } from "@/services/trips";
import ReportUserDialog from "@/components/report/ReportUserDialog";
import { Flag } from "lucide-react";
import { getStoredAuthUser } from "@/services/auth";
import TripTrustRating from "./TripTrustRating";

type ManageMembersSheetProps = {
    tripId: string;
    isLeader?: boolean;
    onChanged?: () => void;
    children: React.ReactNode;
};

export default function ManageMembersSheet({ tripId, isLeader = false, onChanged, children }: ManageMembersSheetProps) {
    const [members, setMembers] = useState<TripMember[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const currentUser = getStoredAuthUser();
    const currentUserId = currentUser?.id;


    const loadMembers = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            setMembers(await getTripMembers(tripId));
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Không thể tải thành viên.");
        } finally {
            setIsLoading(false);
        }
    }, [tripId]);

    useEffect(() => {
        if (isOpen) {
            void loadMembers();
        }
    }, [isOpen, loadMembers]);

    const handleMemberRemoved = (memberUserId: string) => {
        setMembers((prev) => prev.filter((member) => member.userId !== memberUserId));
        onChanged?.();
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
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

                {error && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {members.length === 0 ? (
                            <div className="text-center text-slate-500 py-10 bg-white rounded-2xl border border-slate-100 border-dashed font-medium">
                                Chưa có thành viên nào.
                            </div>
                        ) : members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3.5 border border-slate-200/60 rounded-2xl shadow-sm bg-white hover:shadow-md transition-all">

                                <Link
                                    href={`/profile/${member.userId}`}
                                    className="flex min-w-0 items-center gap-3.5 rounded-xl pr-2 transition-colors hover:bg-slate-50"
                                    title={`Xem trang cá nhân của ${member.name}`}
                                >
                                    <Avatar className="h-11 w-11">
                                        <AvatarImage src={member.avatarUrl ?? undefined} />
                                        <AvatarFallback className={`${member.role === 'LEADER' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'} font-bold`}>
                                            {getInitials(member.name)}
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
                                        <TripTrustRating value={member.trustScore} className="mt-1" />
                                    </div>
                                </Link>

                                {member.userId !== currentUserId && (
                                    <ReportUserDialog
                                        tripId={tripId}
                                        targetUserId={member.userId}
                                        targetUserName={member.name}
                                    >
                                        <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                                            <Flag className="h-4 w-4" />
                                        </Button>
                                    </ReportUserDialog>
                                )}

                                {isLeader && member.role !== "LEADER" && (
                                    <KickMemberAction
                                        tripId={tripId}
                                        memberId={member.userId}
                                        memberName={member.name}
                                        onSuccess={() => handleMemberRemoved(member.userId)}
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

function getInitials(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (words.length === 0) return "TC";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words.map((word) => word[0]).join("").toUpperCase();
}
