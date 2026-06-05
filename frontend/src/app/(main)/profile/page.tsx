"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    AlertTriangle,
    FolderPlus,
    Loader2,
    Award,
    MapPin,
    Calendar,
    Edit,
    CheckCircle2,
    Camera,
    Mail,
    Phone,
    ShieldCheck,
    UserCheck
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import {
    getCurrentUser,
    storeAuthUser,
    updateCurrentUser,
    type AuthUser,
} from "@/services/auth";
import { ApiError } from "@/services/fetchWrapper";
import { getUserInitials } from "@/lib/user";
import UserReviews from "@/components/review/UserReviews";
import RatingStars from "@/components/review/RatingStars";
import { getUserReviews, type UserReview } from "@/services/reviews";
import { uploadImage } from "@/services/auth";

// IMPORT THÊM ĐỒ NGHỀ CHO CHUYẾN ĐI
import { getMyCreatedTrips, getMyJoinedTrips, tripToCardData, type Trip } from "@/services/trips";
import TripCard from "@/components/trip/TripCard";

const profileSchema = z.object({
    name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    bio: z.string().optional(),
    phoneNumber: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    city: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    travelStyle: z.string().optional(),
    travelPreferences: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function getProfileFormDefaults(user: AuthUser): ProfileFormValues {
    return {
        name: user.fullName,
        bio: user.bio || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        city: user.city || "",
        emergencyContactName: user.emergencyContactName || "",
        emergencyContactPhone: user.emergencyContactPhone || "",
        travelStyle: user.travelStyle || "",
        travelPreferences: user.travelPreferences || "",
    };
}

function hasProfileValue(value?: string | null) {
    return Boolean(value?.trim());
}

function getProfileCompletion(user: AuthUser | null) {
    if (!user) return 0;

    const fields = [
        user.avatarUrl,
        user.fullName,
        user.phoneNumber,
        user.dateOfBirth,
        user.city,
        user.emergencyContactPhone,
        hasProfileValue(user.bio) ? user.bio : user.travelStyle,
    ];
    const completed = fields.filter((field) => hasProfileValue(field)).length;

    return Math.round((completed / fields.length) * 100);
}

function TrustStatusItem({
    icon: Icon,
    label,
    verified,
}: {
    icon: React.ElementType;
    label: string;
    verified: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-slate-700">{label}</span>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${verified ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {verified ? "Đã xác minh" : "Chưa xác minh"}
            </span>
        </div>
    );
}

export default function EnhancedProfilePage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const [reviews, setReviews] = useState<UserReview[]>([]);

    // STATE MỚI: Chứa danh sách chuyến đi
    const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
    const [tripsCompletedCount, setTripsCompletedCount] = useState<number>(0);
    const [tripsCreatedCount, setTripsCreatedCount] = useState<number>(0);
    const [createdTripsList, setCreatedTripsList] = useState<Trip[]>([]);
    const [completedTripsList, setCompletedTripsList] = useState<Trip[]>([]);

    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [statusMessage, setStatusMessage] = useState("");

    const [activeTab, setActiveTab] = useState<"about" | "upcoming" | "reviews" | "created" | "completed">("about");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setStatusMessage("Vui lòng chọn file hình ảnh.");
            return;
        }

        setIsUploadingAvatar(true);
        setStatusMessage("");

        try {
            const uploadResult = await uploadImage(file);

            const updatedUser = await updateCurrentUser({ avatarUrl: uploadResult.url });

            setCurrentUser(updatedUser);
            storeAuthUser(updatedUser);
            setStatusMessage("Cập nhật ảnh đại diện thành công!");
        } catch {
            setStatusMessage("Lỗi khi tải ảnh lên. Vui lòng thử lại.");
        } finally {
            setIsUploadingAvatar(false);
            e.target.value = "";
        }
    };

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            bio: "",
            phoneNumber: "",
            dateOfBirth: "",
            gender: "",
            city: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
            travelStyle: "",
            travelPreferences: "",
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
                reset(getProfileFormDefaults(user));

                try {
                    // Gọi song song cả Reviews và Trips cho nhanh
                    const [userReviews, createdTrips, joinedTrips] = await Promise.all([
                        getUserReviews(user.id),
                        getMyCreatedTrips(),
                        getMyJoinedTrips()
                    ]);

                        if (isMounted) {
                            setReviews(userReviews);

                            // Gộp chuyến đi, lọc trùng lặp và tính toán thống kê
                            const allTrips = [...createdTrips, ...joinedTrips];
                            const uniqueTrips = Array.from(new Map(allTrips.map(trip => [trip.id, trip])).values());

                            const upcoming = uniqueTrips
                                .filter(trip => trip.status === "upcoming" || trip.status === "ongoing")
                                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

                            const completedCount = uniqueTrips.filter(trip => trip.status === "completed").length;
                            const createdCount = createdTrips.length;

                            setUpcomingTrips(upcoming);
                            setTripsCompletedCount(completedCount);
                            setTripsCreatedCount(createdCount);
                            setCreatedTripsList(createdTrips);
                            setCompletedTripsList(uniqueTrips.filter(trip => trip.status === "completed"));
                        }
                } catch {
                    if (isMounted) {
                        setReviews([]);
                        setUpcomingTrips([]);
                    }
                }
            } catch (error) {
                if (!isMounted) return;
                if (error instanceof ApiError && [401, 403].includes(error.status)) {
                    router.replace("/login");
                    return;
                }
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
            const updatedUser = await updateCurrentUser({
                fullName: data.name.trim(),
                bio: data.bio,
                phoneNumber: data.phoneNumber,
                dateOfBirth: data.dateOfBirth,
                gender: data.gender,
                city: data.city,
                emergencyContactName: data.emergencyContactName,
                emergencyContactPhone: data.emergencyContactPhone,
                travelStyle: data.travelStyle,
                travelPreferences: data.travelPreferences,
            });
            setCurrentUser(updatedUser);
            storeAuthUser(updatedUser);
            reset(getProfileFormDefaults(updatedUser));
            setIsDialogOpen(false);
        } catch (error) {
            if (error instanceof ApiError && [401, 403].includes(error.status)) {
                router.replace("/login");
                return;
            }
            setStatusMessage("Không thể cập nhật hồ sơ");
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setStatusMessage("");
    };

    if (isLoadingProfile) {
        return (
            <div className="container mx-auto px-4 py-16 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    const trustScore = currentUser?.trustScore ?? 0;
    const displayTrustScore = trustScore.toFixed(1);
    const profileCompletion = getProfileCompletion(currentUser);
    const isProfileReady = Boolean(currentUser?.profileCompleted);
    const needsAvatarForProfile = !hasProfileValue(currentUser?.avatarUrl);

    return (
        <div className="container max-w-5xl mx-auto px-4 py-10">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
                {/* --- KHỐI AVATAR MỚI (CÓ NÚT UPLOAD) --- */}
                <div className="relative group shrink-0">
                    <Avatar className="h-32 w-32 md:h-40 md:w-40 border-[6px] border-blue-50 shadow-sm rounded-full overflow-hidden">
                        <AvatarImage
                            src={currentUser?.avatarUrl || ""}
                            className="object-cover w-full h-full"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-sky-500 text-white text-4xl font-bold rounded-full">
                            {getUserInitials(currentUser)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Hiệu ứng Loading */}
                    {isUploadingAvatar && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-full z-10">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                        </div>
                    )}

                    {/* Lớp phủ Camera khi hover */}
                    <label className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-0">
                        <Camera className="h-8 w-8 text-white" />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                            disabled={isUploadingAvatar}
                        />
                    </label>
                </div>

                <div className="flex-1 text-center md:text-left mt-2">
                    <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-slate-900">
                            {currentUser?.fullName ?? "TripConnect User"}
                        </h1>
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${isProfileReady ? "bg-emerald-600 text-white shadow-emerald-100" : "bg-amber-100 text-amber-800 shadow-amber-50"}`}>
                            {isProfileReady ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                            {isProfileReady ? "Hồ sơ tin cậy" : "Cần bổ sung hồ sơ"}
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-slate-600 mb-4">
                        <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-sky-600" /> {currentUser?.city || "Chưa cập nhật thành phố"}
                        </span>
                        <span className="hidden md:inline text-slate-300">•</span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-indigo-600" /> Thành viên từ 2026
                        </span>
                    </div>
                </div>

                <div className="mt-2">
                    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2 rounded-full font-medium shadow-sm">
                                <Edit className="h-4 w-4" /> Chỉnh sửa hồ sơ
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">Cập nhật hồ sơ</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-bold text-slate-700">Họ và Tên</Label>
                                    <Input id="name" className={errors.name ? "border-red-500" : ""} {...register("name")} />
                                    {errors.name?.message && <p className="text-xs font-medium text-red-600">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="text-sm font-bold text-slate-700">Giới thiệu bản thân (Bio)</Label>
                                    <Textarea id="bio" placeholder="Chia sẻ một chút về đam mê du lịch của bạn..." rows={5} {...register("bio")} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber" className="text-sm font-bold text-slate-700">Số điện thoại</Label>
                                        <Input id="phoneNumber" placeholder="Ví dụ: 0901234567" {...register("phoneNumber")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth" className="text-sm font-bold text-slate-700">Ngày sinh</Label>
                                        <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender" className="text-sm font-bold text-slate-700">Giới tính</Label>
                                        <Input id="gender" placeholder="Nam, nữ, khác..." {...register("gender")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-sm font-bold text-slate-700">Thành phố</Label>
                                        <Input id="city" placeholder="Ví dụ: TP. Hồ Chí Minh" {...register("city")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="emergencyContactName" className="text-sm font-bold text-slate-700">Tên liên hệ khẩn cấp</Label>
                                        <Input id="emergencyContactName" placeholder="Người thân hoặc bạn tin cậy" {...register("emergencyContactName")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="emergencyContactPhone" className="text-sm font-bold text-slate-700">SĐT liên hệ khẩn cấp</Label>
                                        <Input id="emergencyContactPhone" placeholder="Số có thể liên hệ khi cần" {...register("emergencyContactPhone")} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="travelStyle" className="text-sm font-bold text-slate-700">Phong cách du lịch</Label>
                                    <Input id="travelStyle" placeholder="Tự túc, nghỉ dưỡng, khám phá, tiết kiệm..." {...register("travelStyle")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="travelPreferences" className="text-sm font-bold text-slate-700">Sở thích / quy tắc khi đi chung</Label>
                                    <Textarea id="travelPreferences" placeholder="Ví dụ: thích lịch trình rõ ràng, không hút thuốc, ưu tiên ngủ sớm..." rows={4} {...register("travelPreferences")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-bold text-slate-700">Email (Không thể đổi)</Label>
                                    <Input id="email" value={currentUser?.email ?? ""} disabled className="bg-slate-50 text-slate-500" />
                                </div>
                                {statusMessage && (
                                    <p className="rounded-md bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-700">
                                        {statusMessage}
                                    </p>
                                )}
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                                    <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white" disabled={isSubmitting}>
                                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</> : "Lưu thay đổi"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* --- THỐNG KÊ --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md" onClick={() => setActiveTab('reviews')}>
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                        <RatingStars rating={trustScore} className="mb-2" starClassName="h-6 w-6" />
                        <span className="text-3xl font-bold text-amber-950 mb-1">{displayTrustScore}</span>
                        <span className="text-xs text-amber-700 uppercase tracking-wider font-semibold">Average Rating</span>
                    </CardContent>
                </Card>

                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md" onClick={() => setActiveTab('completed')}>
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <Award className="h-6 w-6" />
                        </div>
                        <span className="text-3xl font-bold text-emerald-950 mb-1">{tripsCompletedCount}</span>
                        <span className="text-xs text-emerald-700 uppercase tracking-wider font-semibold">Trips Completed</span>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 via-white to-white shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md" onClick={() => setActiveTab('created')}>
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <FolderPlus className="h-6 w-6" />
                        </div>
                        <span className="text-3xl font-bold text-blue-950 mb-1">{tripsCreatedCount ?? currentUser?.tripsCreated ?? 0}</span>
                        <span className="text-xs text-blue-700 uppercase tracking-wider font-semibold">Trips Created</span>
                    </CardContent>
                </Card>
            </div>

            {/* --- NAVIGATION TABS --- */}
            <div className="flex border-b border-slate-200 mb-8 gap-8 px-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("about")}
                    className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === "about" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Về tôi
                </button>
                <button
                    onClick={() => setActiveTab("upcoming")}
                    className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === "upcoming" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Sắp tới {upcomingTrips.length > 0 && `(${upcomingTrips.length})`}
                </button>
                {/* Reviews tab removed — accessible via clicking the rating card above */}
            </div>

            {/* --- TABS CONTENT --- */}
            <div className="min-h-[300px]">
                {/* TAB: VỀ TÔI */}
                {activeTab === "about" && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-8">
                                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                                            <h3 className="text-lg font-bold text-slate-900">Hồ sơ tin cậy</h3>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            Hoàn thiện các thông tin cần thiết để tạo và tham gia chuyến đi an toàn hơn.
                                        </p>
                                    </div>
                                    <div className="min-w-[180px]">
                                        <div className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-2">
                                            <span>Hoàn thiện</span>
                                            <span>{profileCompletion}%</span>
                                        </div>
                                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full transition-all ${isProfileReady ? "bg-emerald-500" : "bg-amber-500"}`}
                                                style={{ width: `${profileCompletion}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                                    <TrustStatusItem
                                        icon={Mail}
                                        label="Email"
                                        verified={Boolean(currentUser?.emailVerified)}
                                    />
                                    <TrustStatusItem
                                        icon={Phone}
                                        label="Số điện thoại"
                                        verified={Boolean(currentUser?.phoneVerified)}
                                    />
                                    <TrustStatusItem
                                        icon={UserCheck}
                                        label="Danh tính"
                                        verified={Boolean(currentUser?.identityVerified)}
                                    />
                                    <TrustStatusItem
                                        icon={ShieldCheck}
                                        label="Hồ sơ"
                                        verified={isProfileReady}
                                    />
                                </div>

                                <div className={`mt-6 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm font-semibold ${isProfileReady ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                                    {isProfileReady ? (
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                    ) : (
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    )}
                                    <span>
                                        {isProfileReady
                                            ? "Hồ sơ của bạn đã đủ điều kiện tạo và tham gia chuyến đi."
                                            : "Bạn cần hoàn thiện hồ sơ tin cậy trước khi tạo hoặc tham gia chuyến đi."}
                                    </span>
                                </div>
                                {!isProfileReady && needsAvatarForProfile && (
                                    <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                                        Bạn cần cập nhật ảnh đại diện để hoàn thiện hồ sơ tin cậy.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Giới thiệu</h3>
                                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {currentUser?.bio ? currentUser.bio : "Chưa có thông tin giới thiệu. Hãy thêm vài dòng để mọi người hiểu hơn về bạn nhé!"}
                                </div>
                                {(currentUser?.travelStyle || currentUser?.travelPreferences) && (
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 mb-2">Phong cách du lịch</h4>
                                            <p className="text-sm text-slate-600">{currentUser.travelStyle || "Chưa cập nhật"}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 mb-2">Sở thích / quy tắc khi đi chung</h4>
                                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{currentUser.travelPreferences || "Chưa cập nhật"}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TAB: SẮP TỚI */}
                {activeTab === "upcoming" && (
                    <div className="animate-in fade-in duration-300">
                        {upcomingTrips.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {upcomingTrips.map((trip) => (
                                    <TripCard key={trip.id} trip={tripToCardData(trip)} />
                                ))}
                            </div>
                        ) : (
                            <Card className="border-slate-200 shadow-sm border-dashed">
                                <CardContent className="p-16 flex flex-col items-center justify-center text-slate-500 text-center">
                                    <Calendar className="h-12 w-12 text-slate-300 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-700 mb-1">Chưa có chuyến đi nào</h3>
                                    <p className="text-sm">Bạn chưa có chuyến đi nào sắp diễn ra.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* TAB: ĐÁNH GIÁ (kích hoạt khi bấm vào thẻ điểm) */}
                {activeTab === "reviews" && (
                    <div className="animate-in fade-in duration-300">
                        <UserReviews reviews={reviews} />
                    </div>
                )}

                {/* TAB: CHUYẾN ĐÃ TẠO */}
                {activeTab === "created" && (
                    <div className="animate-in fade-in duration-300">
                        {createdTripsList.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {createdTripsList.map((trip) => (
                                    <TripCard key={trip.id} trip={tripToCardData(trip)} />
                                ))}
                            </div>
                        ) : (
                            <Card className="border-slate-200 shadow-sm border-dashed">
                                <CardContent className="p-16 flex flex-col items-center justify-center text-slate-500 text-center">
                                    <h3 className="text-lg font-bold text-slate-700 mb-1">Chưa có chuyến nào được tạo</h3>
                                    <p className="text-sm">Người dùng chưa tạo chuyến nào.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* TAB: CHUYẾN ĐÃ HOÀN THÀNH */}
                {activeTab === "completed" && (
                    <div className="animate-in fade-in duration-300">
                        {completedTripsList.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {completedTripsList.map((trip) => (
                                    <TripCard key={trip.id} trip={tripToCardData(trip)} />
                                ))}
                            </div>
                        ) : (
                            <Card className="border-slate-200 shadow-sm border-dashed">
                                <CardContent className="p-16 flex flex-col items-center justify-center text-slate-500 text-center">
                                    <h3 className="text-lg font-bold text-slate-700 mb-1">Chưa có chuyến đã hoàn thành</h3>
                                    <p className="text-sm">Người dùng chưa hoàn thành chuyến nào.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
