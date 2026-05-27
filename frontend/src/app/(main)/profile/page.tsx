"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    CalendarDays,
    CheckCircle,
    FolderPlus,
    Loader2,
    Mail,
    MessageSquare,
    ShieldCheck,
    Star,
    User,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    getCurrentUser,
    storeAuthUser,
    updateCurrentUser,
    type AuthUser,
} from "@/services/auth";
import { ApiError } from "@/services/fetchWrapper";
import { getUserInitials } from "@/lib/user";

const profileSchema = z.object({
    name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const MOCK_REVIEWS = [
    { id: "1", author: "Minh Phương", rating: 5, date: "15/04/2026", comment: "Leader rất có trách nhiệm, chuẩn bị lịch trình chi tiết và chăm sóc thành viên cực tốt suốt chuyến đi Hà Giang." },
    { id: "2", author: "Tuấn Anh", rating: 4, date: "28/03/2026", comment: "Vui tính, hòa đồng, lái xe rất vững xế tốt trên các cung đường phượt đèo dốc." },
    { id: "3", author: "Khánh Linh", rating: 5, date: "10/01/2026", comment: "Cực kỳ sòng phẳng về chi phí, đúng giờ và luôn hỗ trợ mọi người chụp ảnh sống ảo." }
];

export default function EnhancedProfilePage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [statusMessage, setStatusMessage] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
        },
    });

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            try {
                const user = await getCurrentUser();
                if (!isMounted) return;

                setCurrentUser(user);
                storeAuthUser(user);
                reset({ name: user.fullName });
            } catch (error) {
                if (!isMounted) return;

                if (error instanceof ApiError && [401, 403].includes(error.status)) {
                    router.replace("/login");
                    return;
                }

                setStatusMessage("Không thể tải hồ sơ tài khoản");
            } finally {
                if (isMounted) setIsLoadingProfile(false);
            }
        };

        void loadProfile();

        return () => {
            isMounted = false;
        };
    }, [reset, router]);

    const onSubmit = async (data: ProfileFormValues) => {
        setStatusMessage("");

        try {
            const updatedUser = await updateCurrentUser({ fullName: data.name.trim() });
            setCurrentUser(updatedUser);
            storeAuthUser(updatedUser);
            reset({ name: updatedUser.fullName });
            setStatusMessage("Cập nhật hồ sơ thành công");
        } catch (error) {
            if (error instanceof ApiError && [401, 403].includes(error.status)) {
                router.replace("/login");
                return;
            }

            setStatusMessage("Không thể cập nhật hồ sơ");
        }
    };

    if (isLoadingProfile) {
        return (
            <div className="container mx-auto px-4 py-16 flex justify-center">
                <Card className="w-full max-w-2xl border-slate-200 shadow-md">
                    <CardContent className="p-10 flex items-center justify-center text-slate-500">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải hồ sơ...
                    </CardContent>
                </Card>
            </div>
        );
    }

    const trustScore = currentUser?.trustScore ?? 0;
    const displayTrustScore = trustScore.toFixed(1);
    const filledStars = Math.min(5, Math.max(0, Math.round(trustScore)));

    return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <Card className="w-full max-w-2xl border-slate-200 shadow-md">
                <CardContent className="p-8 flex flex-col items-center">
                    <Avatar className="h-28 w-28 border-4 border-blue-50 shadow-md mb-4">
                        <AvatarFallback className="bg-blue-600 text-white text-3xl font-bold">
                            {getUserInitials(currentUser)}
                        </AvatarFallback>
                    </Avatar>

                    <h2 className="text-2xl font-bold text-slate-900 mb-1">
                        {currentUser?.fullName ?? "TripConnect User"}
                    </h2>
                    <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="h-4 w-4" /> {currentUser?.email}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md mb-6">
                        <ShieldCheck className="h-4 w-4" /> Đã đăng nhập
                    </div>

                    <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 flex flex-col items-center">
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Điểm Uy Tín (Trust Score)</div>

                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-3xl font-black text-slate-800 mr-1">{displayTrustScore}</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-6 w-6 ${star <= filledStars ? "fill-amber-400 text-amber-400" : "fill-amber-400/20 text-amber-400/40"}`}
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-3 w-full gap-2 text-center mt-4 border-t pt-4 border-slate-200/60">
                            <div className="flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1 text-slate-700 font-extrabold text-lg">
                                    <MessageSquare className="h-4 w-4 text-blue-500" /> 0
                                </div>
                                <span className="text-[11px] font-medium text-slate-500 uppercase mt-0.5">Nhận xét</span>
                            </div>
                            <div className="flex flex-col items-center justify-center border-x border-slate-200/60">
                                <div className="flex items-center gap-1 text-slate-700 font-extrabold text-lg">
                                    <CheckCircle className="h-4 w-4 text-emerald-500" /> 0
                                </div>
                                <span className="text-[11px] font-medium text-slate-500 uppercase mt-0.5">Đã hoàn thành</span>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1 text-slate-700 font-extrabold text-lg">
                                    <FolderPlus className="h-4 w-4 text-orange-500" /> 0
                                </div>
                                <span className="text-[11px] font-medium text-slate-500 uppercase mt-0.5">Đã tạo</span>
                            </div>
                        </div>
                    </div>

                    <Separator className="w-full mb-6" />

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full text-left space-y-5">
                        <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide mb-2">Thông tin tài khoản</h3>

                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-bold text-slate-600">Họ và Tên</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input id="name" className={`pl-9 h-11 bg-white border-slate-200 ${errors.name ? "border-red-500" : ""}`} {...register("name")} />
                            </div>
                            {errors.name?.message && (
                                <p className="text-xs font-medium text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-bold text-slate-600">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input id="email" value={currentUser?.email ?? ""} disabled className="pl-9 h-11 bg-slate-50 border-slate-200 text-slate-500" />
                            </div>
                        </div>

                        {statusMessage && (
                            <p className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm font-semibold text-blue-700" role="status">
                                {statusMessage}
                            </p>
                        )}

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold h-11 text-sm shadow-sm" disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</> : "CẬP NHẬT HỒ SƠ"}
                        </Button>
                    </form>

                    <Separator className="w-full my-8" />

                    <div className="w-full text-left space-y-4">
                        <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide mb-2">Đánh giá từ thành viên</h3>

                        <div className="space-y-4">
                            {MOCK_REVIEWS.map((review) => (
                                <div key={review.id} className="bg-slate-50/60 border border-slate-100 rounded-xl p-4 shadow-2xs">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                                {review.author.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-800 text-sm">{review.author}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            <div className="flex items-center text-amber-400">
                                                {Array.from({ length: review.rating }).map((_, i) => (
                                                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                ))}
                                            </div>
                                            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {review.date}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed pl-9">
                                        "{review.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
