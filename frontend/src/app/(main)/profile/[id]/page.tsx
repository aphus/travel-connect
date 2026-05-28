"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    CalendarDays,
    FolderPlus,
    Loader2,
    Mail,
    MessageSquare,
    ShieldCheck,
    Star,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError } from "@/services/fetchWrapper";
import UserReviews from "@/components/review/UserReviews";
import { getUserReviews, type UserReview } from "@/services/reviews";
import { getUserProfile, type PublicUser } from "@/services/users";

export default function PublicProfilePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [user, setUser] = useState<PublicUser | null>(null);
    const [reviews, setReviews] = useState<UserReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isActive = true;

        async function loadProfile() {
            setIsLoading(true);
            setError("");

            try {
                const result = await getUserProfile(params.id);
                let userReviews: UserReview[] = [];

                try {
                    userReviews = await getUserReviews(params.id);
                } catch {
                    userReviews = [];
                }

                if (isActive) {
                    setUser(result);
                    setReviews(userReviews);
                }
            } catch (loadError) {
                if (!isActive) return;

                if (loadError instanceof ApiError && loadError.status === 401) {
                    router.replace("/login");
                    return;
                }

                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Không thể tải trang cá nhân.",
                );
            } finally {
                if (isActive) setIsLoading(false);
            }
        }

        if (params.id) {
            void loadProfile();
        }

        return () => {
            isActive = false;
        };
    }, [params.id, router]);

    if (isLoading) {
        return (
            <div className="container mx-auto flex justify-center px-4 py-16">
                <Card className="w-full max-w-2xl border-slate-200 shadow-md">
                    <CardContent className="flex items-center justify-center p-10 text-slate-500">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải trang cá nhân...
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                    {error || "Không tìm thấy người dùng."}
                </div>
            </div>
        );
    }

    const trustScore = user.trustScore;
    const filledStars = Math.min(5, Math.max(0, Math.round(trustScore)));

    return (
        <div className="container mx-auto flex justify-center px-4 py-8">
            <Card className="w-full max-w-2xl border-slate-200 shadow-md">
                <CardContent className="flex flex-col items-center p-8">
                    <Avatar className="mb-4 h-28 w-28 border-4 border-blue-50 shadow-md">
                        <AvatarFallback className="bg-blue-600 text-3xl font-bold text-white">
                            {getInitials(user.fullName)}
                        </AvatarFallback>
                    </Avatar>

                    <h1 className="mb-1 text-2xl font-bold text-slate-900">
                        {user.fullName}
                    </h1>
                    <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="h-4 w-4" /> {user.email}
                    </div>
                    <div className="mb-6 flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-600">
                        <ShieldCheck className="h-4 w-4" /> Hồ sơ TripConnect
                    </div>

                    <div className="mb-8 flex w-full flex-col items-center rounded-2xl border border-slate-100 bg-slate-50 p-5">
                        <div className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                            Điểm Uy Tín
                        </div>

                        <div className="mb-2 flex items-center gap-1.5">
                            <span className="mr-1 text-3xl font-black text-slate-800">
                                {trustScore.toFixed(1)}
                            </span>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-6 w-6 ${star <= filledStars ? "fill-amber-400 text-amber-400" : "fill-amber-400/20 text-amber-400/40"}`}
                                />
                            ))}
                        </div>

                        <div className="mt-4 grid w-full grid-cols-3 gap-2 border-t border-slate-200/60 pt-4 text-center">
                            <div className="flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1 text-lg font-extrabold text-slate-700">
                                    <MessageSquare className="h-4 w-4 text-blue-500" /> {reviews.length}
                                </div>
                                <span className="mt-0.5 text-[11px] font-medium uppercase text-slate-500">
                                    Nhận xét
                                </span>
                            </div>
                            <div className="flex flex-col items-center justify-center border-r border-slate-200/60">
                                <div className="flex items-center gap-1 text-lg font-extrabold text-slate-700">
                                    <FolderPlus className="h-4 w-4 text-orange-500" /> {user.tripsCreated}
                                </div>
                                <span className="mt-0.5 text-[11px] font-medium uppercase text-slate-500">
                                    Đã tạo
                                </span>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1 text-lg font-extrabold text-slate-700">
                                    <CalendarDays className="h-4 w-4 text-blue-500" />
                                    {formatJoinedDate(user.createdAt)}
                                </div>
                                <span className="mt-0.5 text-[11px] font-medium uppercase text-slate-500">
                                    Tham gia
                                </span>
                            </div>
                        </div>
                    </div>

                    <UserReviews reviews={reviews} />
                </CardContent>
            </Card>
        </div>
    );
}

function getInitials(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (words.length === 0) return "TC";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words.map((word) => word[0]).join("").toUpperCase();
}

function formatJoinedDate(value: string) {
    if (!value) return "N/A";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";

    return new Intl.DateTimeFormat("vi-VN", {
        month: "2-digit",
        year: "numeric",
    }).format(date);
}
