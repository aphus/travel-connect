"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Star } from "lucide-react";
import type { UserReview } from "@/services/reviews";

type UserReviewsProps = {
    reviews: UserReview[];
};

export default function UserReviews({ reviews }: UserReviewsProps) {
    return (
        <div className="w-full space-y-4 text-left">
            <h3 className="mb-2 text-base font-bold uppercase tracking-wide text-slate-900">
                Đánh giá từ thành viên
            </h3>

            {reviews.length === 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                    Chưa có đánh giá nào.
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 shadow-2xs">
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <Link
                                    href={`/profile/${review.reviewer.id}`}
                                    className="flex min-w-0 items-center gap-2 rounded-lg pr-2 transition-colors hover:bg-white"
                                >
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                        {getInitials(review.reviewer.fullName)}
                                    </div>
                                    <span className="truncate text-sm font-bold text-slate-800">
                                        {review.reviewer.fullName}
                                    </span>
                                </Link>

                                <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-slate-400">
                                    <div className="flex items-center text-amber-400">
                                        {Array.from({ length: review.rating }).map((_, index) => (
                                            <Star key={index} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <span className="flex items-center gap-1">
                                        <CalendarDays className="h-3 w-3" /> {formatReviewDate(review.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {review.trip && (
                                <Link
                                    href={`/trips/${review.trip.id}`}
                                    className="mb-2 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                                >
                                    <MapPin className="h-3 w-3" />
                                    {review.trip.destination}
                                </Link>
                            )}

                            <p className="pl-9 text-sm leading-relaxed text-slate-600">
                                {review.comment ? `"${review.comment}"` : "Không có nhận xét kèm theo."}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function getInitials(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (words.length === 0) return "TC";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words.map((word) => word[0]).join("").toUpperCase();
}

function formatReviewDate(value: string) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}
