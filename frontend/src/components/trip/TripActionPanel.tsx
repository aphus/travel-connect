// components/trip/TripActionPanel.tsx
"use client";
import TripCompletionAction from "./TripCompletionAction";
import JoinTripButton from "./JoinTripButton";
import RatingMemberSheet from "./RatingMemberSheet";
import { Button } from "@/components/ui/button";

interface TripActionPanelProps {
    trip: any;
    isLeader: boolean;
    isMember: boolean;
}

export default function TripActionPanel({ trip, isLeader, isMember }: TripActionPanelProps) {
    const status = trip.status;

    // Giả lập danh sách thành viên (Sau này sẽ fetch từ API dựa trên trip.id)
    const members = [
        { id: "m2", name: "Trần Thị Bích", avatar: "TB", trustScore: 95 },
        { id: "m3", name: "Lê Văn Cường", avatar: "LC", trustScore: 88 },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="font-bold text-slate-900 mb-4 border-b pb-3">Thông tin chuyến đi</h3>

            <div className="space-y-3">
                {/* Trường hợp 1: Chuyến đi đang diễn ra */}
                {status === "ONGOING" && (
                    isLeader ? (
                        <TripCompletionAction tripId={trip.id} initialStatus="ONGOING" isLeader={true} />
                    ) : !isMember ? (
                        <JoinTripButton tripId={trip.id} initialStatus="NONE" />
                    ) : (
                        <p className="text-sm text-slate-500 text-center">Bạn đang tham gia chuyến đi này.</p>
                    )
                )}

                {/* Trường hợp 2: Chờ xác nhận (sau khi Leader bấm hoàn thành) */}
                {status === "AWAITING_CONFIRMATION" && !isLeader && isMember && (
                    <TripCompletionAction tripId={trip.id} initialStatus="AWAITING_CONFIRMATION" isLeader={false} />
                )}

                {/* Trường hợp 3: Đã hoàn thành (Tích hợp Rating) */}
                {status === "COMPLETED" && (
                    <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-lg text-center font-medium text-slate-600 text-sm">
                            Chuyến đi đã kết thúc
                        </div>
                        {/* Chỉ cho phép thành viên hoặc Leader đánh giá */}
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