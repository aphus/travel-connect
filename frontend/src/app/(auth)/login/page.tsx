"use client";

import React from "react";
import Link from "next/link";
import { Compass, Mail, Lock, LogIn, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GlassLoginPage() {
    return (
        <div className="w-full max-w-[400px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-8 shadow-2xl flex flex-col items-center">

            {/* Logo & Back to Home */}
            <Link href="/" className="absolute top-6 left-6 text-white/70 hover:text-white flex items-center gap-1 text-sm">
                <ChevronLeft className="h-4 w-4" /> Trang chủ
            </Link>

            <div className="bg-blue-600 rounded-2xl p-3 mb-4 shadow-lg">
                <Compass className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">TripConnect</h1>
            <p className="text-white/70 text-sm mb-8">Vui lòng đăng nhập để tiếp tục</p>

            {/* Form Đăng nhập */}
            <div className="w-full space-y-5">
                <div className="space-y-2">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                        <Input
                            placeholder="Email của bạn"
                            className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-12 rounded-2xl focus-visible:ring-blue-500 focus-visible:bg-white/20 transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                        <Input
                            type="password"
                            placeholder="Mật khẩu"
                            className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-12 rounded-2xl focus-visible:ring-blue-500 focus-visible:bg-white/20 transition-all"
                        />
                    </div>
                    <div className="text-right">
                        <button className="text-xs text-white/60 hover:text-white">Quên mật khẩu?</button>
                    </div>
                </div>

                <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-2xl shadow-xl transition-all active:scale-95">
                    ĐĂNG NHẬP <LogIn className="ml-2 h-5 w-5" />
                </Button>
            </div>

            <div className="mt-8 text-sm text-white/70">
                Bạn chưa có tài khoản?{" "}
                <Link href="/register" className="text-white font-bold hover:underline">
                    Đăng ký ngay
                </Link>
            </div>
        </div>
    );
}