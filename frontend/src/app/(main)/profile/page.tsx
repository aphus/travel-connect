"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, User, Phone, FileText, ShieldCheck, Star, CalendarDays, CheckCircle, FolderPlus, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

// 1. Zod Schema định nghĩa dữ liệu form
const profileSchema = z.object({
    name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    phone: z.string().min(10, { message: "Số điện thoại không hợp lệ" }),
    dob: z.string().min(1, { message: "Vui lòng chọn ngày sinh" }),
    gender: z.string().min(1, { message: "Vui lòng nhập giới tính" }),
    bio: z.string().max(500, { message: "Tiểu sử tối đa 500 ký tự" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// MOCK DATA: Danh sách các nhận xét từ người dùng khác
const MOCK_REVIEWS = [
    { id: "1", author: "Minh Phương", rating: 5, date: "15/04/2026", comment: "Leader rất có trách nhiệm, chuẩn bị lịch trình chi tiết và chăm sóc thành viên cực tốt suốt chuyến đi Hà Giang." },
    { id: "2", author: "Tuấn Anh", rating: 4, date: "28/03/2026", comment: "Vui tính, hòa đồng, lái xe rất vững xế tốt trên các cung đường phượt đèo dốc." },
    { id: "3", author: "Khánh Linh", rating: 5, date: "10/01/2026", comment: "Cực kỳ sòng phẳng về chi phí, đúng giờ và luôn hỗ trợ mọi người chụp ảnh sống ảo." }
];

export default function EnhancedProfilePage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "Đình Thạch",
            phone: "0987654321",
            dob: "2002-01-01",
            gender: "Nam",
            bio: "Đam mê khám phá các vùng đất mới. Thích đi phượt bằng xe máy và cắm trại ngoài trời. Luôn đề cao sự an toàn và tinh thần đồng đội.",
        },
    });

    const onSubmit = async (data: ProfileFormValues) => {
        console.log("Cập nhật hồ sơ thành công:", data);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    };

    return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <Card className="w-full max-w-2xl border-slate-200 shadow-md">
                <CardContent className="p-8 flex flex-col items-center">

                    {/* 1. THÔNG TIN CƠ BẢN (AVATAR, TÊN) */}
                    <Avatar className="h-28 w-28 border-4 border-blue-50 shadow-md mb-4">
                        <AvatarFallback className="bg-blue-600 text-white text-3xl font-bold">ĐT</AvatarFallback>
                    </Avatar>

                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Đình Thạch</h2>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md mb-6">
                        <ShieldCheck className="h-4 w-4" /> Đã xác thực danh tính
                    </div>

                    {/* 2. HIỂN THỊ TRUST SCORE THANG ĐIỂM 1-5 SAO & THỐNG KÊ */}
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 flex flex-col items-center">
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Điểm Uy Tín (Trust Score)</div>

                        {/* Hệ thống 5 sao */}
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-3xl font-black text-slate-800 mr-1">4.7</span>
                            {[1, 2, 3, 4].map((star) => (
                                <Star key={star} className="h-6 w-6 fill-amber-400 text-amber-400" />
                            ))}
                            <Star className="h-6 w-6 fill-amber-400/30 text-amber-400/50" />
                        </div>

                        {/* Hàng thông số thống kê chi tiết */}
                        <div className="grid grid-cols-3 w-full gap-2 text-center mt-4 border-t pt-4 border-slate-200/60">
                            <div className="flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1 text-slate-700 font-extrabold text-lg">
                                    <MessageSquare className="h-4 w-4 text-blue-500" /> 3
                                </div>
                                <span className="text-[11px] font-medium text-slate-500 uppercase mt-0.5">Nhận xét</span>
                            </div>
                            <div className="flex flex-col items-center justify-center border-x border-slate-200/60">
                                <div className="flex items-center gap-1 text-slate-700 font-extrabold text-lg">
                                    <CheckCircle className="h-4 w-4 text-emerald-500" /> 12
                                </div>
                                <span className="text-[11px] font-medium text-slate-500 uppercase mt-0.5">Đã hoàn thành</span>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1 text-slate-700 font-extrabold text-lg">
                                    <FolderPlus className="h-4 w-4 text-orange-500" /> 5
                                </div>
                                <span className="text-[11px] font-medium text-slate-500 uppercase mt-0.5">Đã tạo</span>
                            </div>
                        </div>
                    </div>

                    <Separator className="w-full mb-6" />

                    {/* 3. KHUNG NHẬP LIỆU CẬP NHẬT THÔNG TIN */}
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full text-left space-y-5">
                        <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide mb-2">Thông tin cá nhân</h3>

                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-bold text-slate-600">Họ và Tên</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input id="name" className={`pl-9 h-11 bg-white border-slate-200 ${errors.name ? "border-red-500" : ""}`} {...register("name")} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-xs font-bold text-slate-600">Số điện thoại</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input id="phone" className={`pl-9 h-11 bg-white border-slate-200 ${errors.phone ? "border-red-500" : ""}`} {...register("phone")} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="dob" className="text-xs font-bold text-slate-600">Ngày sinh</Label>
                                <Input type="date" id="dob" className={`h-11 bg-white border-slate-200 ${errors.dob ? "border-red-500" : ""}`} {...register("dob")} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="gender" className="text-xs font-bold text-slate-600">Giới tính</Label>
                                <Input id="gender" className={`h-11 bg-white border-slate-200 ${errors.gender ? "border-red-500" : ""}`} {...register("gender")} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="bio" className="text-xs font-bold text-slate-600">Tiểu sử chuyến đi</Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Textarea id="bio" className={`pl-9 bg-white border-slate-200 min-h-[80px] resize-none ${errors.bio ? "border-red-500" : ""}`} {...register("bio")} />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold h-11 text-sm shadow-sm" disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</> : "CẬP NHẬT HỒ SƠ"}
                        </Button>
                    </form>

                    <Separator className="w-full my-8" />

                    {/* 4. HIỂN THỊ DANH SÁCH CÁC NHẬN XÉT (REVIEW TEXT) */}
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