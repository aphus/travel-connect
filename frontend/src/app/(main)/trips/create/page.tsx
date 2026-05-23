"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Calendar, DollarSign, Users, Type, AlignLeft, Loader2, ImagePlus, Compass } from "lucide-react";

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

// Zod Schema
const createTripSchema = z.object({
    title: z.string().min(10, { message: "Tên chuyến đi cần ít nhất 10 ký tự" }),
    location: z.string().min(2, { message: "Vui lòng nhập địa điểm" }),
    budget: z.string().min(4, { message: "Vui lòng nhập ngân sách hợp lệ" }),
    maxMembers: z.number({ message: "Vui lòng nhập số hợp lệ" })
        .min(2, { message: "Nhóm cần ít nhất 2 người" })
        .max(20, { message: "Tối đa 20 người" }),
    description: z.string().min(20, { message: "Mô tả cần chi tiết hơn (ít nhất 20 ký tự)" }),
    startDate: z.string().min(1, { message: "Vui lòng chọn ngày đi" }),
    endDate: z.string().min(1, { message: "Vui lòng chọn ngày về" }),
}).refine((data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
}, {
    message: "Ngày kết thúc không được trước ngày bắt đầu",
    path: ["endDate"],
});

type CreateTripFormValues = z.infer<typeof createTripSchema>;

export default function CreateTripPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateTripFormValues>({
        resolver: zodResolver(createTripSchema),
    });

    const onSubmit = async (data: CreateTripFormValues) => {
        console.log("Dữ liệu tạo chuyến đi:", data);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    };

    return (
        // 1. THÊM BACKGROUND PHONG CẢNH DU LỊCH & HIỆU ỨNG KÍNH MỜ
        <div className="relative min-h-screen py-12 bg-slate-50">
            {/* Lớp ảnh nền */}
            <div
                className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80')] bg-cover bg-center bg-fixed opacity-40"
            />
            {/* Lớp gradient làm dịu ảnh nền để dễ đọc chữ */}
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

                                <div className="space-y-2">
                                    <Label htmlFor="location" className="font-semibold text-slate-700">Địa điểm đến <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <Input id="location" placeholder="VD: Đà Lạt, Lâm Đồng" className={`pl-11 h-12 text-base bg-slate-50 border-slate-200 transition-all focus:bg-white ${errors.location ? "border-red-500" : ""}`} {...register("location")} />
                                    </div>
                                    {errors.location && <p className="text-sm text-red-500 font-medium">{errors.location.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-5">
                                <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2 mt-8">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                                    Lịch trình & Chi phí
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate" className="font-semibold text-slate-700">Ngày đi <span className="text-red-500">*</span></Label>
                                        <Input id="startDate" type="date" className={`h-12 text-base bg-slate-50 border-slate-200 transition-all focus:bg-white ${errors.startDate ? "border-red-500" : ""}`} {...register("startDate")} />
                                        {errors.startDate && <p className="text-sm text-red-500 font-medium">{errors.startDate.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="endDate" className="font-semibold text-slate-700">Ngày về <span className="text-red-500">*</span></Label>
                                        <Input id="endDate" type="date" className={`h-12 text-base bg-slate-50 border-slate-200 transition-all focus:bg-white ${errors.endDate ? "border-red-500" : ""}`} {...register("endDate")} />
                                        {errors.endDate && <p className="text-sm text-red-500 font-medium">{errors.endDate.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="budget" className="font-semibold text-slate-700">Ngân sách dự kiến / người <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <Input id="budget" placeholder="VD: 2.500.000 VNĐ" className={`pl-11 h-12 text-base bg-slate-50 border-slate-200 transition-all focus:bg-white ${errors.budget ? "border-red-500" : ""}`} {...register("budget")} />
                                        </div>
                                        {errors.budget && <p className="text-sm text-red-500 font-medium">{errors.budget.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="maxMembers" className="font-semibold text-slate-700">Số lượng thành viên tối đa <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <Input id="maxMembers" type="number" placeholder="VD: 6" className={`pl-11 h-12 text-base bg-slate-50 border-slate-200 transition-all focus:bg-white ${errors.maxMembers ? "border-red-500" : ""}`} {...register("maxMembers", { valueAsNumber: true })} />
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
                                    <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-10 text-center hover:bg-blue-50 transition-colors cursor-pointer group">
                                        <ImagePlus className="mx-auto h-10 w-10 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                                        <p className="text-sm text-slate-700 font-semibold">Nhấn để tải ảnh lên (hoặc kéo thả vào đây)</p>
                                        <p className="text-xs text-slate-500 mt-2">PNG, JPG, WEBP lên đến 5MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
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