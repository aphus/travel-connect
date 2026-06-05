"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DollarSign, Users, Type, AlignLeft, Loader2, ImagePlus, Compass, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    formatCurrencyInput,
    getTomorrowDateInputValue,
    normalizePositiveIntegerInput,
    parseCurrencyInput,
    parsePositiveIntegerInput,
} from "@/lib/trip-format";
import { OTHER_DESTINATION_OPTION, resolveTripDestinationPlace } from "@/lib/vietnam-destinations";
import { setAuthFlash } from "@/services/auth";
import { createTrip } from "@/services/trips";
import { ApiError } from "@/services/fetchWrapper";
import { TripDestinationPicker } from "@/components/trip/TripDestinationPicker";

// Zod Schema
const createTripSchema = z.object({
    title: z.string().min(10, { message: "Tên chuyến đi cần ít nhất 10 ký tự" }),
    province: z.string().min(2, { message: "Vui lòng chọn tỉnh/thành phố" }),
    destinationPlace: z.string().min(2, { message: "Vui lòng chọn điểm đến cụ thể" }),
    customDestination: z.string().optional(),
    budget: z.string()
        .min(1, { message: "Vui lòng nhập ngân sách" })
        .refine((value) => {
            const amount = parseCurrencyInput(value);
            return amount !== null && amount > 0;
        }, { message: "Ngân sách phải lớn hơn 0" }),
    maxMembers: z.string()
        .min(1, { message: "Vui lòng nhập số lượng thành viên" })
        .regex(/^\d+$/, { message: "Số lượng thành viên không hợp lệ" })
        .refine((value) => Number(value) >= 2, { message: "Nhóm cần ít nhất 2 người" })
        .refine((value) => Number(value) <= 20, { message: "Tối đa 20 người" }),
    description: z.string().min(20, { message: "Mô tả cần chi tiết hơn (ít nhất 20 ký tự)" }),
    startDate: z.string().min(1, { message: "Vui lòng chọn ngày đi" }),
    endDate: z.string().min(1, { message: "Vui lòng chọn ngày về" }),
}).refine((data) => data.startDate >= getTomorrowDateInputValue(), {
    message: "Ngày đi phải từ ngày mai trở đi",
    path: ["startDate"],
}).refine((data) => data.endDate >= getTomorrowDateInputValue(), {
    message: "Ngày về phải từ ngày mai trở đi",
    path: ["endDate"],
}).refine((data) => {
    return data.endDate >= data.startDate;
}, {
    message: "Ngày về phải bằng hoặc sau ngày đi",
    path: ["endDate"],
}).refine((data) => {
    if (data.destinationPlace !== OTHER_DESTINATION_OPTION) return true;

    return (data.customDestination ?? "").trim().length >= 2;
}, {
    message: "Vui lòng nhập điểm đến khác",
    path: ["customDestination"],
});

type CreateTripFormValues = z.infer<typeof createTripSchema>;

export default function CreateTripPage() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const minTripDate = getTomorrowDateInputValue();
    const {
        register,
        handleSubmit,
        setValue,
        clearErrors,
        control,
        formState: { errors, isSubmitting },
    } = useForm<CreateTripFormValues>({
        resolver: zodResolver(createTripSchema),
        defaultValues: {
            title: "",
            province: "",
            destinationPlace: "",
            customDestination: "",
            budget: "",
            maxMembers: "",
            description: "",
            startDate: "",
            endDate: "",
        },
    });
    const selectedStartDate = useWatch({ control, name: "startDate" });
    const selectedProvince = useWatch({ control, name: "province" });
    const selectedDestinationPlace = useWatch({ control, name: "destinationPlace" });
    const customDestination = useWatch({ control, name: "customDestination" }) ?? "";

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setSubmitError("Kích thước ảnh vượt quá 5MB");
                return;
            }
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setSubmitError("");
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn không cho sự kiện click lan ra khung ngoài
        setImageFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onSubmit = async (data: CreateTripFormValues) => {
        setSubmitError("");

        const budget = parseCurrencyInput(data.budget);
        const maxMembers = parsePositiveIntegerInput(data.maxMembers);

        if (!budget || !maxMembers) {
            setSubmitError("Vui lòng kiểm tra lại ngân sách và số lượng thành viên.");
            return;
        }

        try {
            let uploadedCoverUrl = null;

            // 1. Upload ảnh trước nếu người dùng có chọn ảnh
            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);

                // Lấy Token từ LocalStorage để làm thẻ thông hành
                const token = typeof window !== 'undefined'
                    ? (localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('accessToken'))
                    : null;

                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

                // Gọi API kèm theo Token ở phần headers
                const uploadRes = await fetch(`${baseUrl}/upload/image`, {
                    method: "POST",
                    body: formData,
                    headers: token ? {
                        'Authorization': `Bearer ${token}`
                    } : {},
                });

                if (!uploadRes.ok) {
                    throw new Error("Lỗi khi tải ảnh lên. Vui lòng thử lại!");
                }

                const uploadData = await uploadRes.json();
                uploadedCoverUrl = uploadData.url; // Lấy link ảnh Cloudinary trả về
            }

            // 2. Gửi dữ liệu tạo chuyến đi (kèm link ảnh) xuống backend
            const destinationPlace = resolveTripDestinationPlace(
                data.destinationPlace,
                data.customDestination,
            );

            const trip = await createTrip({
                destination: data.province.trim(),
                destinationPlace,
                startDate: data.startDate,
                endDate: data.endDate,
                budget,
                maxMembers,
                description: `${data.title.trim()}\n\n${data.description.trim()}`,
                coverUrl: uploadedCoverUrl,
            });

            setAuthFlash("Tạo chuyến đi thành công.");
            router.push(`/trips/manage?tab=created&tripId=${trip.id}`);
            router.refresh();
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                setSubmitError("Bạn cần đăng nhập để tạo chuyến đi.");
                return;
            }

            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Không thể tạo chuyến đi. Vui lòng thử lại.",
            );
        }
    };

    return (
        // 1. THÊM BACKGROUND PHONG CẢNH DU LỊCH & HIỆU ỨNG KÍNH MỜ
        <div className="relative min-h-screen py-12 bg-slate-50">
            {/* Lớp ảnh nền */}
            <div
                className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80')] bg-cover bg-center bg-fixed opacity-40"
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/10 to-slate-100/90 backdrop-blur-[2px]" />

            <div className="container relative z-10 mx-auto px-4 max-w-3xl">
                {/* Nâng cấp Card: Thêm bóng đổ to hơn, nền trắng hơi trong suốt */}
                <Card className="shadow-2xl border-white/50 bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 border-b pb-8 pt-8 px-8 text-white">
                        <CardTitle className="text-3xl font-extrabold flex items-center gap-3">
                            <Compass className="h-8 w-8 text-blue-200 animate-pulse" />
                            Lên kèo chuyến đi mới
                        </CardTitle>
                        <CardDescription className="text-blue-100 text-base mt-2">
                            Bắt đầu hành trình của bạn và tìm kiếm những người đồng hành tuyệt vời.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                            <div className="space-y-5">
                                <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                                    Thông tin cơ bản
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="title" className="font-semibold text-slate-700">Tên chuyến đi <span className="text-red-500">*</span></Label>
                                    {/* FIX ICON: Dùng top-1/2 và -translate-y-1/2 */}
                                    <div className="relative">
                                        <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <Input id="title" placeholder="VD: Khám phá Đà Lạt 3N2Đ: Săn mây và cắm trại..." className={`pl-11 h-12 text-base bg-slate-50 border-slate-200 transition-all focus:bg-white ${errors.title ? "border-red-500" : ""}`} {...register("title")} />
                                    </div>
                                    {errors.title && <p className="text-sm text-red-500 font-medium">{errors.title.message}</p>}
                                </div>

                                <TripDestinationPicker
                                    province={selectedProvince}
                                    destinationPlace={selectedDestinationPlace}
                                    customDestination={customDestination}
                                    provinceError={errors.province?.message}
                                    destinationPlaceError={errors.destinationPlace?.message}
                                    customDestinationError={errors.customDestination?.message}
                                    onProvinceChange={(province) => {
                                        setValue("province", province, { shouldDirty: true, shouldValidate: true });
                                        setValue("destinationPlace", "", { shouldDirty: true });
                                        setValue("customDestination", "", { shouldDirty: true });
                                        clearErrors(["destinationPlace", "customDestination"]);
                                    }}
                                    onDestinationPlaceChange={(destinationPlace) => {
                                        setValue("destinationPlace", destinationPlace, { shouldDirty: true, shouldValidate: true });
                                        if (destinationPlace !== OTHER_DESTINATION_OPTION) {
                                            setValue("customDestination", "", { shouldDirty: true });
                                            clearErrors("customDestination");
                                        }
                                    }}
                                    onCustomDestinationChange={(value) => {
                                        setValue("customDestination", value, { shouldDirty: true, shouldValidate: true });
                                    }}
                                />
                            </div>

                            <div className="space-y-5">
                                <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2 mt-8">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                                    Lịch trình & Chi phí
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate" className="font-semibold text-slate-700">Ngày đi <span className="text-red-500">*</span></Label>
                                        <Input id="startDate" type="date" min={minTripDate} className={`h-12 text-base bg-slate-50 border-slate-200 transition-all focus:bg-white ${errors.startDate ? "border-red-500" : ""}`} {...register("startDate")} />
                                        {errors.startDate && <p className="text-sm text-red-500 font-medium">{errors.startDate.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="endDate" className="font-semibold text-slate-700">Ngày về <span className="text-red-500">*</span></Label>
                                        <Input id="endDate" type="date" min={selectedStartDate || minTripDate} className={`h-12 text-base bg-slate-50 border-slate-200 transition-all focus:bg-white ${errors.endDate ? "border-red-500" : ""}`} {...register("endDate")} />
                                        {errors.endDate && <p className="text-sm text-red-500 font-medium">{errors.endDate.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="budget" className="font-semibold text-slate-700">Ngân sách dự kiến <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <Input
                                                id="budget"
                                                inputMode="numeric"
                                                placeholder="VD: 2.500.000"
                                                className={`pl-11 pr-14 h-12 text-base bg-slate-50 border-slate-200 transition-all focus:bg-white ${errors.budget ? "border-red-500" : ""}`}
                                                {...register("budget", {
                                                    onChange: (event) => {
                                                        event.target.value = formatCurrencyInput(event.target.value);
                                                    },
                                                })}
                                            />
                                            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">VNĐ</span>
                                        </div>
                                        {errors.budget && <p className="text-sm text-red-500 font-medium">{errors.budget.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="maxMembers" className="font-semibold text-slate-700">Số lượng thành viên tối đa <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <Input
                                                id="maxMembers"
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                placeholder="VD: 6"
                                                className={`pl-11 h-12 text-base bg-slate-50 border-slate-200 transition-all focus:bg-white ${errors.maxMembers ? "border-red-500" : ""}`}
                                                {...register("maxMembers", {
                                                    onChange: (event) => {
                                                        event.target.value = normalizePositiveIntegerInput(event.target.value);
                                                    },
                                                })}
                                            />
                                        </div>
                                        {errors.maxMembers && <p className="text-sm text-red-500 font-medium">{errors.maxMembers.message}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2 mt-8">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                                    Chi tiết chuyến đi
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="font-semibold text-slate-700">Mô tả chi tiết <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        {/* Riêng Textarea vẫn giữ top-4 vì nó cao, không được căn giữa */}
                                        <AlignLeft className="absolute left-3.5 top-4 h-5 w-5 text-slate-400" />
                                        <Textarea
                                            id="description"
                                            placeholder="Hãy viết chi tiết về lịch trình từng ngày, chỗ ở, phương tiện di chuyển..."
                                            className={`pl-11 py-4 min-h-[160px] text-base bg-slate-50 border-slate-200 transition-all focus:bg-white ${errors.description ? "border-red-500" : ""}`}
                                            {...register("description")}
                                        />
                                    </div>
                                    {errors.description && <p className="text-sm text-red-500 font-medium">{errors.description.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-semibold text-slate-700">Ảnh đại diện chuyến đi</Label>

                                    {/* Input ẩn */}
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/webp"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                    />

                                    {/* Khung hiển thị */}
                                    <div
                                        onClick={handleImageClick}
                                        className="relative border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-2 text-center hover:bg-blue-50 transition-colors cursor-pointer group min-h-[160px] flex flex-col items-center justify-center overflow-hidden"
                                    >
                                        {previewUrl ? (
                                            <>
                                                <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg shadow-sm" />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-4 right-4 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                    onClick={handleRemoveImage}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="py-8">
                                                <ImagePlus className="mx-auto h-10 w-10 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                                                <p className="text-sm text-slate-700 font-semibold">Nhấn để tải ảnh lên (hoặc kéo thả vào đây)</p>
                                                <p className="text-xs text-slate-500 mt-2">PNG, JPG, WEBP lên đến 5MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
                                {submitError && (
                                    <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                                        {submitError}
                                    </p>
                                )}
                                <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Đang thiết lập hành trình...</>
                                    ) : (
                                        "ĐĂNG BÀI TÌM ĐỒNG ĐỘI"
                                    )}
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
