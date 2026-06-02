// components/trip/TripActionPanel.tsx
"use client";

import Link from "next/link";
import TripCompletionAction from "./TripCompletionAction";
import JoinTripButton from "./JoinTripButton";
import RatingMemberSheet from "./RatingMemberSheet";
import ManageMembersSheet from "./ManageMembersSheet";
import LeaveTripAction from "./LeaveTripAction";
import ApprovalSheet from "./ApprovalSheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReportUserDialog from "@/components/report/ReportUserDialog";
import { Flag, LogOut, Users, Clock } from "lucide-react";
import type { JoinStatus } from "@/services/trips";

type TripStatus =
  | "upcoming"
  | "ongoing"
  | "awaiting_confirmation"
  | "completed"
  | "cancelled"
  | "in_progress"
  | "UPCOMING"
  | "ONGOING"
  | "AWAITING_CONFIRMATION"
  | "COMPLETED"
  | "CANCELLED"
  | "IN_PROGRESS";

type TripUser = {
  id?: string;
  user_id?: string;
  name?: string;
  full_name?: string;
  fullName?: string;
  avatar?: string | null;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  trustScore?: number;
  trust_score?: number;
};

type TripMemberLike = {
  id?: string;
  user_id?: string;
  userId?: string;
  user?: TripUser;
  name?: string;
  full_name?: string;
  fullName?: string;
  avatar?: string | null;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  trustScore?: number;
  trust_score?: number;
};

type TripActionPanelTrip = {
  id: string;
  leader_id?: string;
  leaderId?: string;
  status?: TripStatus;
  leader?: TripUser;
  members?: TripMemberLike[];
  trip_members?: TripMemberLike[];
  pendingRequests?: number;
  pending_requests?: number;
};

type TripActionPanelProps = {
  trip: TripActionPanelTrip;
  isLeader: boolean;
  isMember: boolean;
  joinStatus?: JoinStatus | null;
  onChanged?: () => void;
};

function normalizeStatus(status?: TripStatus) {
  const normalized = String(status || "UPCOMING").toUpperCase();
  return normalized === "IN_PROGRESS" ? "ONGOING" : normalized;
}

function getDisplayName(user: TripUser | TripMemberLike) {
  return user.name || user.fullName || user.full_name || "Đang cập nhật";
}

function getAvatar(user: TripUser | TripMemberLike) {
  return user.avatar || user.avatarUrl || user.avatar_url || "";
}

function getTrustScore(user: TripUser | TripMemberLike) {
  return user.trustScore ?? user.trust_score ?? 0;
}

export default function TripActionPanel({
  trip,
  isLeader,
  isMember,
  joinStatus,
  onChanged,
}: TripActionPanelProps) {
  const status = normalizeStatus(trip.status);
  const pendingRequests = trip.pendingRequests ?? trip.pending_requests ?? 0;

  const rawLeader: TripUser = trip.leader ?? {};
  const leader = {
    id: rawLeader.id || trip.leaderId || trip.leader_id || "leader-1",
    name: getDisplayName(rawLeader),
    trustScore: getTrustScore(rawLeader),
    avatar: getAvatar(rawLeader),
  };

  const rawMembers: TripMemberLike[] = Array.isArray(trip.members)
    ? trip.members
    : Array.isArray(trip.trip_members)
      ? trip.trip_members
      : [];

  const members = rawMembers
    .map((member) => {
      const user: TripUser | TripMemberLike = member.user ?? member;

      return {
        id: user.id || member.userId || member.user_id || member.id || "",
        name: getDisplayName(user),
        avatar: getAvatar(user),
        trustScore: getTrustScore(user),
      };
    })
    .filter((member) => Boolean(member.id));

  const canJoin = status === "UPCOMING";
  const canManageBeforeTrip = status === "UPCOMING";
  const shouldShowJoinStatus =
    joinStatus === "PENDING" ||
    joinStatus === "REJECTED" ||
    joinStatus === "REMOVED" ||
    joinStatus === "LEFT";
  const canLeaderComplete =
    status === "UPCOMING" || status === "ONGOING" || status === "AWAITING_CONFIRMATION";
  const canRate = status === "COMPLETED";

  const completionInitialStatus =
    status === "AWAITING_CONFIRMATION"
      ? "AWAITING_CONFIRMATION"
      : status === "COMPLETED"
        ? "COMPLETED"
        : "ONGOING";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
      {status === "AWAITING_CONFIRMATION" && (
        <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 shadow-sm">
          <h4 className="font-bold flex items-center gap-2">
            <Clock className="h-4 w-4" /> Đang chờ xác nhận
          </h4>
          <p className="text-sm mt-1">
            {isLeader
              ? "Hệ thống đang chờ các thành viên xác nhận hoàn thành chuyến đi."
              : "Leader đã yêu cầu hoàn thành. Vui lòng xác nhận để kết thúc chuyến đi."}
          </p>
        </div>
      )}

      <h3 className="font-bold text-slate-900 mb-4">Người dẫn đoàn</h3>

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

        {isMember && leader.id && (
          <ReportUserDialog
            tripId={trip.id}
            targetUserId={leader.id}
            targetUserName={leader.name}
          >
            <button
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all absolute right-0 top-0"
              title="Báo cáo vi phạm"
              type="button"
            >
              <Flag className="w-5 h-5" />
            </button>
          </ReportUserDialog>
        )}
      </div>

      {members.length > 0 && (
        <div className="mb-6">
          <h4 className="font-bold text-slate-900 text-sm mb-3">
            Thành viên tham gia
          </h4>
          <div className="space-y-3">
            {members.slice(0, 4).map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                    {member.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {member.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Trust Score:{" "}
                    <span className="text-amber-500 font-semibold">
                      {member.trustScore}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {isLeader && (
          <div className="space-y-3">
            {/* Những thứ chỉ hiện khi trip chưa diễn ra */}
            {canManageBeforeTrip && (
              <>
                <Link href={`/trips/manage?tab=created&tripId=${trip.id}`}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 font-bold">
                    Quản lý chuyến đi
                  </Button>
                </Link>

                <ApprovalSheet tripId={trip.id} onChanged={onChanged}>
                  <Button
                    variant="outline"
                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 font-bold"
                    disabled={pendingRequests <= 0}
                  >
                    Duyệt đơn ({pendingRequests})
                  </Button>
                </ApprovalSheet>
              </>
            )}

            {/* Nút Danh sách thành viên: TÁCH RA ĐỂ HIỂN THỊ MỌI TRẠNG THÁI */}
            <ManageMembersSheet tripId={trip.id} isLeader onChanged={onChanged}>
              <Button
                variant="outline"
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 font-bold"
              >
                <Users className="mr-2 h-4 w-4" />
                Danh sách thành viên
              </Button>
            </ManageMembersSheet>
          </div>
        )}

        {isLeader && canLeaderComplete && (
          <TripCompletionAction
            tripId={trip.id}
            initialStatus={completionInitialStatus}
            isLeader={true}
            onCompleted={onChanged}
          />
        )}

        {!isLeader && isMember && (
          <div className="space-y-3">
            <ManageMembersSheet tripId={trip.id} isLeader={false}>
              <Button
                variant="outline"
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 font-bold"
              >
                <Users className="mr-2 h-4 w-4" />
                Xem thành viên
              </Button>
            </ManageMembersSheet>

            {canManageBeforeTrip && (
              <LeaveTripAction
                tripId={trip.id}
                status="APPROVED"
                onSuccess={onChanged}
              >
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Rời khỏi chuyến đi
                </Button>
              </LeaveTripAction>
            )}

            {status === "AWAITING_CONFIRMATION" && (
              <TripCompletionAction
                tripId={trip.id}
                initialStatus="AWAITING_CONFIRMATION"
                isLeader={false}
                onCompleted={onChanged}
              />
            )}
          </div>
        )}

        {!isLeader &&
          !isMember &&
          (canJoin || shouldShowJoinStatus ? (
            <JoinTripButton
              tripId={trip.id}
              initialStatus={joinStatus ?? "NONE"}
              onSuccess={onChanged}
            />
          ) : (
            <div className="p-3 bg-slate-50 rounded-lg text-center font-medium text-slate-500 text-sm">
              {status === "ONGOING"
                ? "Chuyến đi đang diễn ra"
                : "Không thể tham gia"}
            </div>
          ))}

        {canRate && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg text-center font-medium text-slate-600 text-sm border border-slate-200">
              Chuyến đi đã kết thúc
            </div>

            {(isLeader || isMember) && (
              <RatingMemberSheet tripId={trip.id}>
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
