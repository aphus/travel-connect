"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TripCard from "@/components/trip/TripCard";

// MOCK DATA: Dữ liệu giả lập cho Bảng tin
const MOCK_TRIPS = [
    {
        id: "1",
        title: "Khám phá Đà Lạt 3N2Đ: Săn mây và cắm trại đồi chè",
        location: "Đà Lạt",
        startDate: "25/06/2026",
        endDate: "27/06/2026",
        budget: "2.500.000đ",
        currentMembers: 3,
        maxMembers: 6,
        imageUrl: "https://images.unsplash.com/photo-1559586616-361e18714958?auto=format&fit=crop&q=80",
        leader: { name: "Đình Thạch", trustScore: 98 }
    },
    {
        id: "2",
        title: "Trekking Tà Năng - Phan Dũng: Cung đường đẹp nhất VN",
        location: "Lâm Đồng",
        startDate: "02/07/2026",
        endDate: "04/07/2026",
        budget: "3.200.000đ",
        currentMembers: 8,
        maxMembers: 8,
        imageUrl: "https://images.unsplash.com/photo-1583248352195-d3a8e766edf2?auto=format&fit=crop&q=80",
        leader: { name: "Tuấn Anh", trustScore: 85 }
    },
    {
        id: "3",
        title: "Phượt xe máy Hà Giang - Sông Nho Quế",
        location: "Hà Giang",
        startDate: "10/08/2026",
        endDate: "15/08/2026",
        budget: "4.000.000đ",
        currentMembers: 2,
        maxMembers: 10,
        imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80",
        leader: { name: "Minh Phương", trustScore: 92 }
    }
];

// Tạo Component con chứa logic để có thể bọc Suspense
function FeedContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. Khởi tạo state từ URL (để giữ lại chữ người dùng đã gõ sau khi tải lại trang)
    const [location, setLocation] = useState(searchParams.get("location") || "");
    const [startDate, setStartDate] = useState(searchParams.get("date") || "");
    const [budget, setBudget] = useState(searchParams.get("budget") || "");
    const [members, setMembers] = useState(searchParams.get("members") || "");

    // 2. Logic cập nhật URL khi bấm Tìm kiếm
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (location) params.set("location", location);
        if (startDate) params.set("date", startDate);
        if (budget) params.set("budget", budget);
        if (members) params.set("members", members);

        router.push(`/feed?${params.toString()}`);
    };

    // 3. Logic lọc mảng MOCK_TRIPS dựa trên URL hiện tại
    const queryLocation = searchParams.get("location")?.toLowerCase() || "";
    const filteredTrips = MOCK_TRIPS.filter((trip) => {
        if (!queryLocation) return true;
        // Kiểm tra xem chữ gõ vào có nằm trong Tên chuyến đi hoặc Địa điểm không
        return (
            trip.location.toLowerCase().includes(queryLocation) ||
            trip.title.toLowerCase().includes(queryLocation)
        );
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* TIÊU ĐỀ TRANG */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Khám phá chuyến đi</h1>
                <p className="text-slate-500">
                    Tìm kiếm và ghép nhóm với những người bạn đồng hành tuyệt vời trên mọi nẻo đường.
                </p>
            </div>

            {/* BỘ LỌC TÌM KIẾM - Đã bọc bằng form */}
            <form onSubmit={handleSearch} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* 1. Địa điểm */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Địa điểm</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Bạn muốn đi đâu?"
                                className="pl-9 h-12 bg-white border border-slate-200 focus-visible:ring-rose-500"
                            />
                        </div>
                    </div>

                    {/* 2. Ngày khởi hành */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Ngày khởi hành</label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-12 bg-white border border-slate-200 focus-visible:ring-rose-500 text-slate-600"
                        />
                    </div>

                    {/* 3. Ngân sách */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Ngân sách dự kiến</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                placeholder="Mức chi phí"
                                className="pl-9 h-12 bg-white border border-slate-200 focus-visible:ring-rose-500"
                            />
                        </div>
                    </div>

                    {/* 4. Số lượng thành viên */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Số lượng thành viên</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="number"
                                value={members}
                                onChange={(e) => setMembers(e.target.value)}
                                placeholder="Số người tối đa"
                                className="pl-9 h-12 bg-white border border-slate-200 focus-visible:ring-rose-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Nút tìm kiếm */}
                <div className="mt-6">
                    <Button type="submit" className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-md transition-all">
                        <Search className="mr-2 h-5 w-5" /> Tìm kiếm ngay
                    </Button>
                </div>
            </form>

            {/* DANH SÁCH CHUYẾN ĐI LỌC THEO TỪ KHÓA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTrips.length > 0 ? (
                    filteredTrips.map((trip) => (
                        <TripCard key={trip.id} trip={trip} />
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center text-slate-500">
                        Không tìm thấy chuyến đi nào khớp với từ khóa "{queryLocation}".
                    </div>
                )}
            </div>
        </div>
    );
}

// Component chính export ra ngoài
export default function FeedPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Đang tải bảng tin...</div>}>
            <FeedContent />
        </Suspense>
    );
}