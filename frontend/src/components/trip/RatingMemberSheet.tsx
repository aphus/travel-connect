"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flag, Loader2, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import ReportUserDialog from "@/components/report/ReportUserDialog";
import { getStoredAuthUser } from "@/services/auth";
import { createReview } from "@/services/reviews";
import { getTripMembers, type TripMember } from "@/services/trips";

interface RatingMemberProps {
  children: React.ReactNode;
  tripId: string;
}

function getInitials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || "TV";
}

export default function RatingMemberSheet({
  children,
  tripId,
}: RatingMemberProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<TripMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  const [submittedIds, setSubmittedIds] = useState<Record<string, boolean>>({});
  const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const loadMembers = useCallback(async () => {
    const currentUser = getStoredAuthUser();

    setIsLoadingMembers(true);
    setError("");

    try {
      const result = await getTripMembers(tripId);
      setMembers(result.filter((member) => member.userId !== currentUser?.id));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải danh sách thành viên.",
      );
    } finally {
      setIsLoadingMembers(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (isOpen) {
      void loadMembers();
    }
  }, [isOpen, loadMembers]);

  const handleRatingChange = (memberId: string, star: number) => {
    setRatings((prev) => ({ ...prev, [memberId]: star }));
    setSubmitErrors((prev) => ({ ...prev, [memberId]: "" }));
    setError("");
  };

  const handleCommentChange = (memberId: string, value: string) => {
    setComments((prev) => ({ ...prev, [memberId]: value }));
  };

  const handleSubmitRating = async (memberId: string) => {
    const rating = ratings[memberId] || 0;
    const comment = comments[memberId] || "";

    if (rating === 0) {
      setSubmitErrors((prev) => ({
        ...prev,
        [memberId]: "Vui lòng chọn số sao trước khi gửi đánh giá.",
      }));
      return;
    }

    setError("");
    setSubmitErrors((prev) => ({ ...prev, [memberId]: "" }));
    setIsSubmitting((prev) => ({ ...prev, [memberId]: true }));

    try {
      await createReview({
        tripId,
        revieweeId: memberId,
        rating,
        comment: comment.trim() || undefined,
      });

      setSubmittedIds((prev) => ({ ...prev, [memberId]: true }));
      setRatings((prev) => ({ ...prev, [memberId]: 0 }));
      setComments((prev) => ({ ...prev, [memberId]: "" }));
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Không thể gửi đánh giá.";

      setSubmitErrors((prev) => ({ ...prev, [memberId]: message }));
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Đánh giá thành viên
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {error && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          {isLoadingMembers ? (
            <div className="flex justify-center py-10 text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang tải thành viên...
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
              Chưa có thành viên khác để đánh giá.
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.userId}
                className="relative p-4 border rounded-xl shadow-sm bg-white"
              >
                <div className="absolute top-4 right-4">
                  <ReportUserDialog
                    targetUserId={member.userId}
                    targetUserName={member.name}
                  >
                    <button
                      className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                      title="Báo cáo vi phạm"
                      type="button"
                    >
                      <Flag className="w-5 h-5" />
                    </button>
                  </ReportUserDialog>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={member.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h4 className="font-bold text-sm">{member.name}</h4>
                    <p className="text-xs text-slate-500">
                      Trust Score:{" "}
                      <span className="text-amber-500 font-semibold">
                        {member.trustScore}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 cursor-pointer transition-colors ${
                        (ratings[member.userId] || 0) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                      onClick={() => handleRatingChange(member.userId, star)}
                    />
                  ))}
                </div>

                <Textarea
                  placeholder="Nhận xét về thành viên này (tùy chọn)..."
                  className="mb-3 resize-none"
                  value={comments[member.userId] || ""}
                  onChange={(e) =>
                    handleCommentChange(member.userId, e.target.value)
                  }
                  disabled={submittedIds[member.userId]}
                />

                {submitErrors[member.userId] && (
                  <p className="mb-3 text-sm font-medium text-red-600">
                    {submitErrors[member.userId]}
                  </p>
                )}

                <Button
                  className="w-full bg-slate-900 hover:bg-slate-800"
                  onClick={() => handleSubmitRating(member.userId)}
                  disabled={
                    isSubmitting[member.userId] || submittedIds[member.userId]
                  }
                >
                  {submittedIds[member.userId]
                    ? "Đã gửi đánh giá"
                    : isSubmitting[member.userId]
                      ? "Đang gửi..."
                      : "Gửi đánh giá"}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
