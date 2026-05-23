"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, Lock, User, CheckCircle2, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 1. Định nghĩa Schema kiểm tra lỗi cho Đăng ký
const registerSchema = z.object({
    name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    email: z.string().min(1, { message: "Vui lòng nhập email" }).email({ message: "Email không hợp lệ" }),
    password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
    confirmPassword: z.string().min(1, { message: "Vui lòng xác nhận mật khẩu" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        console.log("Dữ liệu đăng ký gửi đi:", data);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    };

    return (
        <div className="flex min-h-screen w-full bg-white">

            {/* NỬA TRÁI: HÌNH ẢNH & THÔNG TIN (Giống trang Login) */}
            <div
                className="relative hidden lg:flex w-1/2 flex-col justify-center p-12 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-700/90 mix-blend-multiply" />

                <div className="relative z-10 text-white max-w-lg">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Compass className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-wider">TripConnect</span>
                    </div>

                    <h1 className="text-4xl font-bold mb-6 leading-tight">
                        Khởi đầu hành trình <br /> của riêng bạn
                    </h1>
                    <p className="text-blue-100 text-lg mb-8">
                        Tạo tài khoản ngay hôm nay để kết nối với hàng ngàn người đam mê du lịch trên khắp Việt Nam.
                    </p>

                    <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-blue-50">
                            <CheckCircle2 className="h-5 w-5 text-blue-300" /> Tạo và quản lý chuyến đi dễ dàng
                        </li>
                        <li className="flex items-center gap-3 text-blue-50">
                            <CheckCircle2 className="h-5 w-5 text-blue-300" /> Hệ thống đánh giá Trust Score uy tín
                        </li>
                        <li className="flex items-center gap-3 text-blue-50">
                            <CheckCircle2 className="h-5 w-5 text-blue-300" /> Chat nhóm Realtime tiện lợi
                        </li>
                    </ul>
                </div>
            </div>

            {/* NỬA PHẢI: FORM ĐĂNG KÝ */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-md space-y-8 py-8">

                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Đăng ký</h2>
                        <p className="text-slate-500">Điền thông tin dưới đây để tạo tài khoản mới</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* Input Họ và Tên */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-700">Họ và tên <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="name"
                                    placeholder="Nhập họ và tên của bạn"
                                    className={`pl-10 h-12 bg-slate-50/50 ${errors.name ? "border-red-500" : ""}`}
                                    {...register("name")}
                                />
                            </div>
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>

                        {/* Input Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700">Email <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Nhập email của bạn"
                                    className={`pl-10 h-12 bg-slate-50/50 ${errors.email ? "border-red-500" : ""}`}
                                    {...register("email")}
                                />
                            </div>
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        {/* Input Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700">Mật khẩu <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Tạo mật khẩu (Ít nhất 6 ký tự)"
                                    className={`pl-10 h-12 bg-slate-50/50 ${errors.password ? "border-red-500" : ""}`}
                                    {...register("password")}
                                />
                            </div>
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>

                        {/* Input Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-slate-700">Xác nhận mật khẩu <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Nhập lại mật khẩu"
                                    className={`pl-10 h-12 bg-slate-50/50 ${errors.confirmPassword ? "border-red-500" : ""}`}
                                    {...register("confirmPassword")}
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                        </div>

                        {/* Nút Submit màu Gradient */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 transition-all mt-4"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang xử lý...</>
                            ) : (
                                "ĐĂNG KÝ →"
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-slate-500">
                        Đã có tài khoản?{" "}
                        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                            Đăng nhập ngay
                        </Link>
                    </div>

                </div>
            </div>

        </div>
    );
}