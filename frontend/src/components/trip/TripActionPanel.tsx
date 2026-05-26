// components/trip/TripActionPanel.tsx
"use client";
import TripCompletionAction from "./TripCompletionAction";
import JoinTripButton from "./JoinTripButton";
import RatingMemberSheet from "./RatingMemberSheet";
import ManageMembersSheet from "./ManageMembersSheet";
import LeaveTripAction from "./LeaveTripAction";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReportUserDialog from "@/components/report/ReportUserDialog";
import { Flag, LogOut } from "lucide-react";

interface TripActionPanelProps {
    trip: any;
    isLeader: boolean;
    isMember: boolean;
}

export default function TripActionPanel({ trip, isLeader, isMember }: TripActionPanelProps) {
    // Đảm bảo có giá trị mặc định tránh lỗi undefined
    const status = trip?.status || "UPCOMING";
    const leader = trip?.leader || { name: "Đang cập nhật", trustScore: 0, avatar: "" };

    // Giả lập danh sách thành viên
    const members = [
        { id: "m2", name: "Trần Thị Bích", avatar: "TB", trustScore: 95 },
        { id: "m3", name: "Lê Văn Cường", avatar: "LC", trustScore: 88 },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="font-bold text-slate-900 mb-4">Người dẫn đoàn</h3>

            {/* BỔ SUNG: Khối hiển thị thông tin Trưởng đoàn */}
            {/* BỔ SUNG: Khối hiển thị thông tin Trưởng đoàn có nút Báo cáo */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 relative">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={leader.avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                        {leader.name ? leader.name.substring(0, 2).toUpperCase() : "LD"}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">{leader.name}</h4>
                    <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-slate-500">
                        <span>Trust Score:</span>
                        <span className="text-amber-500">{leader.trustScore}</span>
                    </div>
                </div>

                {/* BỌC NÚT BẤM VÀO TRONG REPORT DIALOG */}
                {/* (Tạm để targetUserId là "leader-1" để test) */}
                {isMember && (
                    <ReportUserDialog targetUserId="leader-1" targetUserName={leader.name}>
                        <button
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all absolute right-0 top-0"
                            title="Báo cáo vi phạm"
                        >
                            <Flag className="w-5 h-5" />
                        </button>
                    </ReportUserDialog>
                )}
            </div>

            <div className="space-y-3">
                {/* 1. Dành cho LEADER */}
                {isLeader && status === "ONGOING" && (
                    <TripCompletionAction tripId={trip.id} initialStatus="ONGOING" isLeader={true} />
                )}

                {/* 2. Dành cho MEMBER */}
                {!isLeader && isMember && (
                    <div className="space-y-3">
                        {status === "ONGOING" && (
                            <div className="p-3 bg-blue-50 rounded-lg text-center font-medium text-blue-600 text-sm border border-blue-100">
                                Bạn đang tham gia chuyến đi này
                            </div>
                        )}

                        {status === "AWAITING_CONFIRMATION" && (
                            <TripCompletionAction tripId={trip.id} initialStatus="AWAITING_CONFIRMATION" isLeader={false} />
                        )}

                        {/* BỔ SUNG: Nút Xem thành viên và Rời nhóm (Chỉ hiện khi chưa hoàn thành) */}
                        {status === "UPCOMING" && (
                            <LeaveTripAction tripId={trip.id} status="APPROVED">
                                <Button variant="outline" className="w-full flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                                    <LogOut className="w-4 h-4 mr-2" /> Rời khỏi chuyến đi
                                </Button>
                            </LeaveTripAction>
                        )}
                    </div>
                )}

                {/* 3. Dành cho GUEST (Chưa tham gia) */}
                {!isLeader && !isMember && (
                    status === "UPCOMING" ? (
                        <JoinTripButton tripId={trip.id} initialStatus="NONE" />
                    ) : (
                        <div className="p-3 bg-slate-50 rounded-lg text-center font-medium text-slate-500 text-sm">
                            {status === "ONGOING" ? "Chuyến đi đang diễn ra" : "Không thể tham gia"}
                        </div>
                    )
                )}

                {/* 4. GIAI ĐOẠN ĐÁNH GIÁ (COMPLETED) */}
                {status === "COMPLETED" && (
                    <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-lg text-center font-medium text-slate-600 text-sm border border-slate-200">
                            Chuyến đi đã kết thúc
                        </div>
                        {(isLeader || isMember) && (
                            <RatingMemberSheet tripId={trip.id} members={members}>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    Đánh giá thành viên
                                </Button>
                            </RatingMemberSheet>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}