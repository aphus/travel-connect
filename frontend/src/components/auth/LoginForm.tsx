"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Giả lập xử lý đăng nhập, sau 1s chuyển về Trang chủ
        setTimeout(() => {
            router.push("/");
        }, 1000);
    };

    return (
        <form onSubmit={handleLogin} className="w-full space-y-5">
            <div className="space-y-2">
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                    <Input
                        type="email"
                        required
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
                        required
                        placeholder="Mật khẩu"
                        className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-12 rounded-2xl focus-visible:ring-blue-500 focus-visible:bg-white/20 transition-all"
                    />
                </div>
                <div className="text-right">
                    <button type="button" className="text-xs text-white/60 hover:text-white">Quên mật khẩu?</button>
                </div>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-70"
            >
                {isSubmitting ? "ĐANG XỬ LÝ..." : (
                    <>ĐĂNG NHẬP <LogIn className="ml-2 h-5 w-5" /></>
                )}
            </Button>
        </form>
    );
}