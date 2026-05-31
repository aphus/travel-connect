"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    CalendarDays,
    Loader2,
    MapPin,
    Star,
    Award,
    CheckCircle2
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError } from "@/services/fetchWrapper";
import UserReviews from "@/components/review/UserReviews";
import { getUserReviews, type UserReview } from "@/services/reviews";
import { getUserProfile, type PublicUser } from "@/services/users";

export default function PublicProfilePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    // Ép kiểu nhẹ để hứng bio (nếu type PublicUser chưa được cập nhật)
    const [user, setUser] = useState<(PublicUser & { bio?: string | null }) | null>(null);
    const [reviews, setReviews] = useState<UserReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [activeTab, setActiveTab] = useState<"about" | "reviews">("about");

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
            <div className="container mx-auto px-4 py-16 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
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

    const trustScore = user.trustScore ?? 0;
    const displayTrustScore = trustScore.toFixed(1);

    const shortName = user.fullName.split(" ").pop() || "Thành viên";

    return (
        <div className="container max-w-5xl mx-auto px-4 py-10">
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-[6px] border-slate-50 shadow-sm rounded-full overflow-hidden">
                    <AvatarImage
                        src={user.avatarUrl || ""}
                        className="object-cover w-full h-full"
                    />
                    <AvatarFallback className="bg-slate-800 text-white text-4xl font-bold rounded-full">
                        {getInitials(user.fullName)}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left mt-2">
                    <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-slate-900">
                            {user.fullName}
                        </h1>
                        <span className="flex items-center gap-1.5 bg-slate-800 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-slate-600 mb-4">
                        <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" /> Vietnam
                        </span>
                        <span className="hidden md:inline text-slate-300">•</span>
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" /> Tham gia {formatJoinedYear(user.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            {/* --- STATS SECTION --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                        <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-5 w-5 fill-slate-800 text-slate-800" />
                            ))}
                        </div>
                        <span className="text-3xl font-bold text-slate-900 mb-1">{displayTrustScore}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Average Rating</span>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                        <Award className="h-6 w-6 text-slate-400 mb-3" />
                        <span className="text-3xl font-bold text-slate-900 mb-1">0</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Trips Completed</span>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                        <MapPin className="h-6 w-6 text-slate-400 mb-3" />
                        <span className="text-3xl font-bold text-slate-900 mb-1">{user.tripsCreated ?? 0}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Trips Created</span>
                    </CardContent>
                </Card>
            </div>

            {/* --- TABS NAVIGATION --- */}
            <div className="flex border-b border-slate-200 mb-8 gap-8 px-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("about")}
                    className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === "about" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Về {shortName}
                </button>
                <button
                    onClick={() => setActiveTab("reviews")}
                    className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === "reviews" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Đánh giá ({reviews.length})
                </button>
            </div>

            {/* --- TABS CONTENT --- */}
            <div className="min-h-[300px]">
                {/* TAB: VỀ TÔI */}
                {activeTab === "about" && (
                    <div className="animate-in fade-in duration-300">
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Giới thiệu</h3>
                                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {(user as any).bio ? (user as any).bio : "Thành viên này chưa cập nhật thông tin giới thiệu."}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TAB: ĐÁNH GIÁ */}
                {activeTab === "reviews" && (
                    <div className="animate-in fade-in duration-300">
                        <UserReviews reviews={reviews} />
                    </div>
                )}
            </div>
        </div>
    );
}

function getInitials(name: string) {
    if (!name) return "TC";
    const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (words.length === 0) return "TC";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words.map((word) => word[0]).join("").toUpperCase();
}

function formatJoinedYear(value: string) {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.getFullYear().toString();
}