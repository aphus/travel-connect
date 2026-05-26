"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Giả lập xử lý đăng ký, sau 1s chuyển về trang Login
        setTimeout(() => {
            router.push("/login");
        }, 1000);
    };

    return (
        <form onSubmit={handleRegister} className="w-full space-y-4">
            <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <Input
                    type="text"
                    required
                    placeholder="Họ và tên của bạn"
                    className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-12 rounded-2xl focus-visible:ring-blue-500"
                />
            </div>

            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <Input
                    type="email"
                    required
                    placeholder="Email liên lạc"
                    className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-12 rounded-2xl focus-visible:ring-blue-500"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                    <Input
                        type="password"
                        required
                        placeholder="Mật khẩu"
                        className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-12 rounded-2xl focus-visible:ring-blue-500"
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                    <Input
                        type="password"
                        required
                        placeholder="Nhập lại"
                        className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-12 rounded-2xl focus-visible:ring-blue-500"
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-2xl shadow-xl transition-all mt-4 disabled:opacity-70"
            >
                {isSubmitting ? "ĐANG TẠO..." : (
                    <>TẠO TÀI KHOẢN <UserPlus className="ml-2 h-5 w-5" /></>
                )}
            </Button>
        </form>
    );
}