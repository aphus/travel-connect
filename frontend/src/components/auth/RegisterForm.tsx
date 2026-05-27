"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthErrorMessage, registerUser, setAuthFlash, storeAuthUser } from "@/services/auth";
import { setAccessToken, validateStoredToken } from "@/services/fetchWrapper";

export default function RegisterForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        const redirectIfAuthenticated = async () => {
            if (await validateStoredToken()) {
                if (isMounted) router.replace("/feed");
            }
        };

        void redirectIfAuthenticated();

        return () => {
            isMounted = false;
        };
    }, [router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (password !== confirmPassword) {
            setErrorMessage("Mật khẩu nhập lại không khớp");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await registerUser({
                fullName: fullName.trim(),
                email: email.trim(),
                password,
            });

            storeAuthUser(response.user);
            setAccessToken(response.accessToken);
            setAuthFlash(`Tạo tài khoản thành công. Xin chào ${response.user.fullName}!`);
            router.replace("/feed");
            router.refresh();
        } catch (error) {
            setErrorMessage(getAuthErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleRegister} className="w-full space-y-4">
            <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    type="text"
                    required
                    minLength={2}
                    autoComplete="name"
                    placeholder="Họ và tên của bạn"
                    className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-12 rounded-2xl focus-visible:ring-blue-500"
                />
            </div>

            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Email liên lạc"
                    className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-12 rounded-2xl focus-visible:ring-blue-500"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                    <Input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="Mật khẩu"
                        className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-12 rounded-2xl focus-visible:ring-blue-500"
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                    <Input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type="password"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="Nhập lại"
                        className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-12 rounded-2xl focus-visible:ring-blue-500"
                    />
                </div>
            </div>

            {errorMessage && (
                <p className="rounded-xl bg-red-500/15 border border-red-300/30 px-4 py-3 text-sm font-medium text-red-100" role="alert" aria-live="polite">
                    {errorMessage}
                </p>
            )}

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
