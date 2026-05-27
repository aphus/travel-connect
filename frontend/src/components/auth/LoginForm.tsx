"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthErrorMessage, loginUser, setAuthFlash, storeAuthUser } from "@/services/auth";
import { setAccessToken, validateStoredToken } from "@/services/fetchWrapper";

export default function LoginForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const response = await loginUser({
                email: email.trim(),
                password,
            });

            storeAuthUser(response.user);
            setAccessToken(response.accessToken);
            setAuthFlash(`Đăng nhập thành công. Xin chào ${response.user.fullName}!`);
            router.replace("/feed");
            router.refresh();
        } catch (error) {
            setErrorMessage(getAuthErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="w-full space-y-5">
            <div className="space-y-2">
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="Email của bạn"
                        className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-12 rounded-2xl focus-visible:ring-blue-500 focus-visible:bg-white/20 transition-all"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                    <Input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        required
                        minLength={6}
                        autoComplete="current-password"
                        placeholder="Mật khẩu"
                        className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-12 rounded-2xl focus-visible:ring-blue-500 focus-visible:bg-white/20 transition-all"
                    />
                </div>
                <div className="text-right">
                    <button type="button" className="text-xs text-white/60 hover:text-white">Quên mật khẩu?</button>
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
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-70"
            >
                {isSubmitting ? "ĐANG XỬ LÝ..." : (
                    <>ĐĂNG NHẬP <LogIn className="ml-2 h-5 w-5" /></>
                )}
            </Button>
        </form>
    );
}
