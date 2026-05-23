"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, Lock, CheckCircle2, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 1. Định nghĩa Schema (Giữ nguyên dùng Email thay vì SĐT để chuẩn với lúc đăng ký)
const loginSchema = z.object({
    email: z.string().min(1, { message: "Vui lòng nhập email" }).email({ message: "Email không hợp lệ" }),
    password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginFormValues) => {
        console.log("Dữ liệu gửi đi:", data);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    };

    return (
        <div className="flex min-h-screen w-full bg-white">

            {/* NỬA TRÁI: HÌNH ẢNH & THÔNG TIN (Sẽ ẩn đi khi dùng điện thoại lg:flex) */}
            <div
                className="relative hidden lg:flex w-1/2 flex-col justify-center p-12 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')" }}
            >
                {/* Lớp phủ Gradient mờ */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-700/90 mix-blend-multiply" />

                {/* Nội dung chữ (Đẩy lên trên lớp phủ bằng z-10) */}
                <div className="relative z-10 text-white max-w-lg">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Compass className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-wider">TripConnect</span>
                    </div>

                    <h1 className="text-4xl font-bold mb-6 leading-tight">
                        Nền tảng kết nối du lịch <br /> và hành trình đáng tin cậy
                    </h1>
                    <p className="text-blue-100 text-lg mb-8">
                        Tìm kiếm những người đồng hành đáng tin cậy, ghép nhóm nhanh chóng và khám phá Việt Nam theo cách của riêng bạn.
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

            {/* NỬA PHẢI: FORM ĐĂNG NHẬP */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">

                    <div className="text-center">
                        <div className="mx-auto bg-blue-600 rounded-2xl w-14 h-14 flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30">
                            <Lock className="h-7 w-7 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Đăng nhập</h2>
                        <p className="text-slate-500">Vui lòng nhập thông tin đăng nhập của bạn</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Input Email có icon bên trong */}
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

                        {/* Input Password có icon bên trong */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700">Mật khẩu <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Nhập mật khẩu"
                                    className={`pl-10 h-12 bg-slate-50/50 ${errors.password ? "border-red-500" : ""}`}
                                    {...register("password")}
                                />
                            </div>
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}

                            <div className="flex justify-end pt-1">
                                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                    Quên mật khẩu?
                                </Link>
                            </div>
                        </div>

                        {/* Nút Submit màu Gradient */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 transition-all"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang xử lý...</>
                            ) : (
                                "ĐĂNG NHẬP →"
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-slate-500">
                        Chưa có tài khoản?{" "}
                        <Link href="/register" className="font-semibold text-blue-600 hover:underline">
                            Đăng ký ngay
                        </Link>
                    </div>

                </div>
            </div>

        </div>
    );
}