import React from "react";
import Link from "next/link";
import { Compass, ChevronLeft } from "lucide-react";
import RegisterForm from "@/components/auth/RegisterForm";

export default function GlassRegisterPage() {
    return (
        <div className="w-full max-w-[450px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-8 shadow-2xl flex flex-col items-center relative">

            <Link href="/" className="absolute top-6 left-6 text-white/70 hover:text-white flex items-center gap-1 text-sm">
                <ChevronLeft className="h-4 w-4" /> Trang chủ
            </Link>

            <div className="bg-blue-600 rounded-2xl p-3 mb-4 shadow-lg">
                <Compass className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Bắt đầu hành trình</h1>
            <p className="text-white/70 text-sm mb-8 text-center px-4">Tham gia cộng đồng để kết nối với những người bạn đồng hành</p>

            {/* Triệu hồi Form Đăng ký */}
            <RegisterForm />

            <div className="mt-8 text-sm text-white/70">
                Bạn đã có tài khoản?{" "}
                <Link href="/login" className="text-white font-bold hover:underline">
                    Đăng nhập ngay
                </Link>
            </div>
        </div>
    );
}