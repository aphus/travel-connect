"use client";

import React from "react";
import { useParams } from "next/navigation"; // Hook lấy ID từ URL
import { Calendar, DollarSign, MapPin, Users, CheckCircle2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TripDetailPage() {
    const params = useParams(); // Lấy ID của chuyến đi hiện tại
    const tripId = params.id;

    return (
        <div className="pb-12">
            {/* 1. ẢNH BÌA COVER */}
            <div className="w-full h-[40vh] bg-slate-200 relative">
                <img
                    src="https://images.unsplash.com/photo-1559586616-361e18714958?auto=format&fit=crop&q=80&w=2000"
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-8 left-0 w-full">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 shadow-sm">
                            Khám phá Đà Lạt 3N2Đ: Săn mây và cắm trại đồi chè
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium">
                            <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm"><MapPin className="h-4 w-4" /> Đà Lạt</span>
                            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> 25/06 - 27/06/2026</span>
                            <span className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> 2.500.000đ</span>
                            <span className="flex items-center gap-2"><Users className="h-4 w-4" /> 3/6 thành viên</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. NỘI DUNG CHÍNH */}
            <div className="container mx-auto px-4 max-w-5xl mt-8 flex flex-col md:flex-row gap-8">

                {/* Cột trái: Mô tả chi tiết */}
                <div className="flex-1 space-y-8">
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Navigation className="h-6 w-6 text-blue-600" /> Mô tả lịch trình
                        </h2>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                            Ngày 1: Đón đoàn tại bến xe, di chuyển về homestay cất đồ. Buổi chiều đi săn mây tại đồi chè Cầu Đất.
                            Ngày 2: Trekking nhẹ nhàng qua rừng thông, tổ chức BBQ và cắm trại qua đêm.
                            Ngày 3: Tham quan thác Datanla, mua sắm đặc sản và lên xe về lại thành phố.
                            <br /><br />
                            Yêu cầu: Cần các bạn hòa đồng, có sức khỏe tốt để trekking.
                        </p>
                    </section>
                </div>

                {/* Cột phải: Thông tin Leader & Form đăng ký */}
                <div className="w-full md:w-[350px] space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
                        <h3 className="font-bold text-slate-900 mb-4 text-lg border-b pb-3">Người dẫn đoàn</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <Avatar className="h-14 w-14 border-2 border-blue-100">
                                <AvatarFallback className="bg-blue-600 text-white font-bold text-xl">Đ</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-bold text-slate-900 text-lg">Đình Thạch</div>
                                <div className="flex items-center gap-1 text-sm text-green-600 font-medium mt-1">
                                    <CheckCircle2 className="h-4 w-4" /> Đã xác thực
                                </div>
                                <div className="text-sm text-slate-500 mt-1">Trust Score: <span className="text-blue-600 font-bold">98/100</span></div>
                            </div>
                        </div>

                        {/* Nút hành động chính của UC-05 */}
                        <Button className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700">
                            Gửi yêu cầu tham gia
                        </Button>
                        <p className="text-xs text-center text-slate-500 mt-3">
                            Yêu cầu của bạn sẽ được Leader xem xét.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}