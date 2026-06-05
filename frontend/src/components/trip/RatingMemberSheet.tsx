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
import { createReview, getTripReviews } from "@/services/reviews";
import { getTripMembers, type TripMember } from "@/services/trips";
import TripTrustRating from "./TripTrustRating";

interface RatingMemberProps {
  children: React.ReactNode;
  tripId: string;
}

function getInitials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || "TV";
}

const ALREADY_REVIEWED_MESSAGE = "Bạn đã đánh giá thành viên này rồi.";

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
    setSubmitErrors({});

    try {
      const [membersResult, reviewsResult] = await Promise.all([
        getTripMembers(tripId),
        getTripReviews(tripId),
      ]);
      const existingReviews = reviewsResult.filter(
        (review) => review.reviewer.id === currentUser?.id,
      );
      const nextSubmittedIds: Record<string, boolean> = {};
      const nextRatings: Record<string, number> = {};
      const nextComments: Record<string, string> = {};

      existingReviews.forEach((review) => {
        nextSubmittedIds[review.reviewee.id] = true;
        nextRatings[review.reviewee.id] = review.rating;
        nextComments[review.reviewee.id] = review.comment ?? "";
      });

      setMembers(
        membersResult.filter((member) => member.userId !== currentUser?.id),
      );
      setSubmittedIds(nextSubmittedIds);
      setRatings(nextRatings);
      setComments(nextComments);
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
      const timeoutId = window.setTimeout(() => {
        void loadMembers();
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [isOpen, loadMembers]);

  const handleAlreadyReviewedClick = (memberId: string) => {
    setSubmitErrors((prev) => ({
      ...prev,
      [memberId]: ALREADY_REVIEWED_MESSAGE,
    }));
  };

  const handleRatingChange = (memberId: string, star: number) => {
    if (submittedIds[memberId]) {
      handleAlreadyReviewedClick(memberId);
      return;
    }

    setRatings((prev) => ({ ...prev, [memberId]: star }));
    setSubmitErrors((prev) => ({ ...prev, [memberId]: "" }));
    setError("");
  };

  const handleCommentChange = (memberId: string, value: string) => {
    if (submittedIds[memberId]) {
      handleAlreadyReviewedClick(memberId);
      return;
    }

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
    } catch (submitError) {
      if (isAlreadyReviewedError(submitError)) {
        setSubmittedIds((prev) => ({ ...prev, [memberId]: true }));
        setSubmitErrors((prev) => ({
          ...prev,
          [memberId]: ALREADY_REVIEWED_MESSAGE,
        }));
        return;
      }

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
            members.map((member) => {
              const isAlreadyReviewed = submittedIds[member.userId] ?? false;
              const isMemberSubmitting = isSubmitting[member.userId] ?? false;
              const memberRating = ratings[member.userId] || 0;
              const memberComment = comments[member.userId] || "";

              return (
                <div
                  key={member.userId}
                  className="relative p-4 border rounded-xl shadow-sm bg-white"
                >
                  <div className="absolute top-4 right-4">
                    <ReportUserDialog
                      tripId={tripId}
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
                      <TripTrustRating value={member.trustScore} />
                      {isAlreadyReviewed && (
                        <p className="mt-1 text-xs font-semibold text-emerald-600">
                          Đã đánh giá
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 transition-colors ${
                          isAlreadyReviewed
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                        } ${
                          memberRating >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                        onClick={() =>
                          isAlreadyReviewed
                            ? handleAlreadyReviewedClick(member.userId)
                            : handleRatingChange(member.userId, star)
                        }
                      />
                    ))}
                  </div>

                  <Textarea
                    placeholder="Nhận xét về thành viên này (tùy chọn)..."
                    className={`mb-3 resize-none ${
                      isAlreadyReviewed
                        ? "cursor-not-allowed bg-slate-50 text-slate-500"
                        : ""
                    }`}
                    value={memberComment}
                    onClick={() => {
                      if (isAlreadyReviewed) {
                        handleAlreadyReviewedClick(member.userId);
                      }
                    }}
                    onChange={(e) =>
                      handleCommentChange(member.userId, e.target.value)
                    }
                    readOnly={isAlreadyReviewed}
                    disabled={isMemberSubmitting}
                  />

                  {submitErrors[member.userId] && (
                    <p className="mb-3 text-sm font-medium text-red-600">
                      {submitErrors[member.userId]}
                    </p>
                  )}

                  <Button
                    className={`w-full ${
                      isAlreadyReviewed
                        ? "cursor-not-allowed bg-slate-200 text-slate-500 hover:bg-slate-200"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                    onClick={() =>
                      isAlreadyReviewed
                        ? handleAlreadyReviewedClick(member.userId)
                        : handleSubmitRating(member.userId)
                    }
                    disabled={isMemberSubmitting}
                    aria-disabled={isAlreadyReviewed}
                  >
                    {isAlreadyReviewed
                      ? "Đã đánh giá"
                      : isMemberSubmitting
                        ? "Đang gửi..."
                        : "Gửi đánh giá"}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function isAlreadyReviewedError(error: unknown) {
  return (
    error instanceof Error &&
    /already been reviewed|đã đánh giá/i.test(error.message)
  );
}
