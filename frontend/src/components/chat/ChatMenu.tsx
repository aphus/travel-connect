"use client";

import { MoreVertical, Users, Info, LogOut, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ManageMembersSheet from "@/components/trip/ManageMembersSheet";
import ReportUserDialog from "@/components/report/ReportUserDialog"; // Import thêm cái này
import { leaveTrip } from "@/services/trips";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ChatMenu({
    tripId,
    leaderId, // Thêm leaderId để báo cáo
    isLeader,
    isMember
}: {
    tripId: string;
    leaderId: string; // Thêm prop này
    isLeader: boolean;
    isMember: boolean;
}) {
    const router = useRouter();

    const handleLeaveTrip = async () => {
        if (confirm("Bạn có chắc chắn muốn rời khỏi chuyến đi này?")) {
            try {
                await leaveTrip(tripId);
                router.push("/trips");
            } catch (error) {
                alert("Có lỗi xảy ra khi rời chuyến đi");
            }
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <ManageMembersSheet tripId={tripId} isLeader={isLeader}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer font-semibold">
                        <Users className="mr-2 h-4 w-4" /> Danh sách thành viên
                    </DropdownMenuItem>
                </ManageMembersSheet>

                <DropdownMenuItem asChild className="cursor-pointer font-semibold">
                    <Link href={`/trips/${tripId}`}>
                        <Info className="mr-2 h-4 w-4" /> Thông tin chuyến đi
                    </Link>
                </DropdownMenuItem>

                {/* Nút Báo cáo */}
                <ReportUserDialog
                    tripId={tripId}
                    targetUserId={leaderId}
                    targetUserName="Leader chuyến đi"
                >
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer font-semibold text-amber-600 focus:text-amber-700">
                        <Flag className="mr-2 h-4 w-4" /> Báo cáo chuyến đi
                    </DropdownMenuItem>
                </ReportUserDialog>

                {/* Nút Rời chuyến đi - Điều kiện chỉ cần là Member */}
                {!isLeader && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer font-semibold text-red-600 focus:text-red-600"
                            onClick={handleLeaveTrip}
                        >
                            <LogOut className="mr-2 h-4 w-4" /> Rời chuyến đi
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}