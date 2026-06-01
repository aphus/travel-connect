"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Mail, Lock, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import { loginUser, storeAuthUser, getAuthErrorMessage } from "@/services/auth";
import { setAccessToken } from "@/services/fetchWrapper";


export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const data = await loginUser({ email, password });

            if (data.user.role !== "ADMIN" && data.user.role !== "admin") {
                setError("Tài khoản của bạn không có quyền truy cập trang quản trị.");
                setIsLoading(false);
                return;
            }

            setAccessToken(data.accessToken);
            storeAuthUser(data.user);

            router.push("/admin/dashboard");

        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80')` }}
        >
            <div className="absolute inset-0 bg-black/40"></div>

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-[420px]">
                <div className="bg-white/10 backdrop-blur-md py-10 px-8 shadow-2xl rounded-3xl border border-white/20 text-white">

                    <Link href="/" className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors mb-6">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Trang chủ
                    </Link>

                    {/* Logo & Tiêu đề */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                            <Compass className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">TripAdmin</h2>
                        <p className="mt-2 text-sm text-white/80 font-medium">Vui lòng đăng nhập bằng quyền Quản trị</p>
                    </div>

                    {/* Form Đăng nhập */}
                    <form className="space-y-5" onSubmit={handleLogin}>
                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-100 text-sm font-medium text-center backdrop-blur-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-white/60" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 border border-white/20 rounded-2xl bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent sm:text-sm transition-all"
                                    placeholder="Email quản trị"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-white/60" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 border border-white/20 rounded-2xl bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent sm:text-sm transition-all"
                                    placeholder="Mật khẩu"
                                />
                            </div>
                            <div className="flex justify-end mt-2">
                                <a href="#" className="text-xs font-medium text-white/70 hover:text-white transition-colors">
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    ĐĂNG NHẬP <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-white/50">
                        Hệ thống nội bộ. Vui lòng liên hệ Super Admin nếu quên tài khoản.
                    </div>
                </div>
            </div>
        </div>
    );
}