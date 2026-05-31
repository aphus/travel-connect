"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Star } from "lucide-react";
import type { UserReview } from "@/services/reviews";

type UserReviewsProps = {
    reviews: UserReview[];
};

export default function UserReviews({ reviews }: UserReviewsProps) {
    // Tính điểm đánh giá trung bình
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : "0";

    return (
        <div className="w-full">
            {/* --- HEADER TỔNG QUAN --- */}
            <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
                <Star className="h-7 w-7 fill-slate-900 text-slate-900" />
                <h2 className="text-2xl font-bold text-slate-900">
                    {reviews.length > 0 ? `${averageRating} · ${reviews.length} đánh giá` : "Chưa có đánh giá"}
                </h2>
            </div>

            {reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 flex flex-col items-center justify-center text-slate-500 text-center">
                    <Star className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 mb-1">Chưa có nhận xét</h3>
                    <p className="text-sm">Thành viên này chưa nhận được đánh giá nào.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">

                            <div className="space-y-4">
                                {/* THÔNG TIN NGƯỜI ĐÁNH GIÁ */}
                                <div className="flex items-center justify-between">
                                    <Link href={`/profile/${review.reviewer.id}`} className="flex items-center gap-4 group">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shadow-sm transition-transform group-hover:scale-105">
                                            {getInitials(review.reviewer.fullName)}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                                                {review.reviewer.fullName}
                                            </h4>
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-0.5">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                <span>{formatReviewDate(review.createdAt)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                {/* RATING & CHUYẾN ĐI */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <Star
                                                key={index}
                                                className={`h-4 w-4 ${index < review.rating ? "fill-slate-900 text-slate-900" : "fill-slate-100 text-slate-200"}`}
                                            />
                                        ))}
                                    </div>

                                    {review.trip && (
                                        <Link
                                            href={`/trips/${review.trip.id}`}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                                        >
                                            <MapPin className="h-3.5 w-3.5 text-slate-500" />
                                            <span className="truncate max-w-[140px]">{review.trip.destination}</span>
                                        </Link>
                                    )}
                                </div>

                                {/* NỘI DUNG ĐÁNH GIÁ */}
                                <p className="text-slate-700 leading-relaxed text-sm">
                                    {review.comment ? `"${review.comment}"` : <span className="italic text-slate-400">Không có nhận xét kèm theo.</span>}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Giữ nguyên các hàm helper của mày
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