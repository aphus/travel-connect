"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, PlusCircle, Search, MapPin, Calendar, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// MOCK DATA: Chuyến đi nổi bật để hiển thị trên Trang chủ
const FEATURED_TRIPS = [
  { id: '1', title: 'Khám phá Đà Lạt 3N2Đ: Săn mây và cắm trại', location: 'Đà Lạt', startDate: '25/06/2026', currentMembers: 3, maxMembers: 6, imageUrl: 'https://images.unsplash.com/photo-1559586616-361e18714958?auto=format&fit=crop&q=80&w=800' },
  { id: '2', title: 'Trekking Tà Năng - Phan Dũng: Cung đường đẹp nhất VN', location: 'Lâm Đồng', startDate: '02/07/2026', currentMembers: 8, maxMembers: 8, imageUrl: 'https://images.unsplash.com/photo-1583248352195-d3a8e766edf2?auto=format&fit=crop&q=80&w=800' },
  { id: '3', title: 'Phượt xe máy Hà Giang - Sông Nho Quế', location: 'Hà Giang', startDate: '10/08/2026', currentMembers: 2, maxMembers: 10, imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800' },
];

export default function MegaHomePage() {
  const router = useRouter();

  // Khởi tạo state để lưu trữ dữ liệu tìm kiếm
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [budget, setBudget] = useState("");
  const [members, setMembers] = useState("");

  // Hàm xử lý khi ấn Tìm kiếm ngay
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Gắn dữ liệu vào query string
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (startDate) params.set("date", startDate);
    if (budget) params.set("budget", budget);
    if (members) params.set("members", members);

    // Điều hướng người dùng sang trang Feed cùng với kết quả lọc
    router.push(`/feed?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12 font-sans">

      {/* 1. HERO BANNER (Phong cách cungdi.net) */}
      <div className="relative w-full min-h-[75vh] bg-slate-900 flex flex-col items-center justify-center pb-24">
        {/* Ảnh nền khinh khí cầu/núi non */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-50" />

        <div className="relative z-10 text-center px-4 pt-28 container mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-xl tracking-tight leading-tight">
            GHÉP ĐÔI DU LỊCH, GHÉP NHÓM DU LỊCH
          </h1>
          <p className="text-lg md:text-xl text-slate-100 font-medium max-w-3xl mx-auto drop-shadow-md mb-10">
            Tìm kiếm kết nối những người bạn du lịch có cùng sở thích, cùng điểm đến cùng nhau trải nghiệm những chuyến du lịch thú vị.
          </p>

          {/* Hai nút chức năng chính */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/feed">
              <Button className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-full shadow-lg transition-transform hover:scale-105">
                <Search className="mr-2 h-5 w-5" /> Tìm bạn đồng hành
              </Button>
            </Link>
            <Link href="/trips/create">
              <Button className="h-14 px-8 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-lg rounded-full shadow-lg border-none transition-transform hover:scale-105">
                <PlusCircle className="mr-2 h-5 w-5" /> Tạo chuyến đi ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. BỘ LỌC TÌM KIẾM (Nằm đè lên banner) - Đã chuyển thành Form */}
      <div className="container mx-auto px-4 -mt-20 relative z-20 max-w-6xl">
        <form onSubmit={handleSearch} className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <h2 className="text-xl font-bold text-rose-600 mb-6 text-center uppercase tracking-wide">
            Tìm kiếm bạn đồng hành du lịch
          </h2>

          {/* LƯỚI CHI ĐỀU 4 CỘT CHO 4 TIÊU CHÍ */}
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

          {/* NÚT TÌM KIẾM ĐẶT RIÊNG BIỆT PHÍA DƯỚI */}
          <div className="mt-6">
            <Button type="submit" className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-md transition-all">
              <Search className="mr-2 h-5 w-5" /> Tìm kiếm ngay
            </Button>
          </div>

        </form>
      </div>

      {/* 3. BẢNG TIN CHUYẾN ĐI (FEED RÚT GỌN) */}
      <div className="container mx-auto px-4 mt-16 max-w-6xl">
        <div className="flex justify-between items-end mb-8 border-b pb-4 border-slate-200">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Chuyến đi nổi bật</h2>
            <p className="text-slate-500 mt-1">Những hành trình đang được quan tâm nhất tuần này.</p>
          </div>
          <Link href="/feed" className="text-blue-600 font-bold hover:underline hidden sm:block">
            Xem tất cả &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_TRIPS.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`} className="group h-full cursor-pointer">
              <Card className="h-full overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 bg-white">
                <div className="relative h-56 w-full overflow-hidden">
                  <img src={trip.imageUrl} alt={trip.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  <Badge className="absolute top-4 right-4 bg-white/90 text-slate-900 font-bold shadow-sm border-none backdrop-blur-sm px-3 py-1">
                    {trip.location}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {trip.title}
                  </h3>
                  <div className="space-y-3 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>{trip.startDate}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-orange-500" />
                      <span>{trip.currentMembers} / {trip.maxMembers} thành viên</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Nút xem thêm cho Mobile */}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/feed">
            <Button variant="outline" className="w-full h-12 font-bold text-blue-600 border-blue-200 bg-blue-50">
              Xem tất cả chuyến đi
            </Button>
          </Link>
        </div>
      </div>

    </div>
  );
}