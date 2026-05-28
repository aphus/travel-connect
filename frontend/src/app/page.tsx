"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Search, MapPin, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TripCard from "@/components/trip/TripCard";
import {
  formatCurrencyInput,
  getTomorrowDateInputValue,
  normalizePositiveIntegerInput,
  parseCurrencyInput,
  parsePositiveIntegerInput,
} from "@/lib/trip-format";
import { listTrips, tripToCardData, type Trip } from "@/services/trips";

export default function MegaHomePage() {
  const router = useRouter();

  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [budget, setBudget] = useState("");
  const [members, setMembers] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [tripsError, setTripsError] = useState("");
  const [searchError, setSearchError] = useState("");
  const minTripDate = getTomorrowDateInputValue();

  useEffect(() => {
    let isActive = true;

    async function loadTrips() {
      setIsLoadingTrips(true);
      setTripsError("");

      try {
        const result = await listTrips();
        if (isActive) setTrips(result);
      } catch (error) {
        if (!isActive) return;

        setTripsError(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách chuyến đi.",
        );
      } finally {
        if (isActive) setIsLoadingTrips(false);
      }
    }

    void loadTrips();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");

    const parsedBudget = parseCurrencyInput(budget);
    const parsedMembers = parsePositiveIntegerInput(members);

    if (startDate && startDate < minTripDate) {
      setSearchError("Ngày khởi hành phải từ ngày mai trở đi.");
      return;
    }

    if (budget && (!parsedBudget || parsedBudget <= 0)) {
      setSearchError("Ngân sách phải lớn hơn 0.");
      return;
    }

    if (members && (!parsedMembers || parsedMembers <= 0)) {
      setSearchError("Số lượng thành viên phải lớn hơn 0.");
      return;
    }

    const params = new URLSearchParams();
    if (location.trim()) params.set("destination", location.trim());
    if (startDate) params.set("startDate", startDate);
    if (parsedBudget) params.set("budget", String(parsedBudget));
    if (parsedMembers) params.set("maxMembers", String(parsedMembers));

    const query = params.toString();
    router.push(query ? `/feed?${query}` : "/feed");
  };

  const cardTrips = trips.map(tripToCardData);

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
                min={minTripDate}
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
                  inputMode="numeric"
                  value={budget}
                  onChange={(e) => setBudget(formatCurrencyInput(e.target.value))}
                  placeholder="Mức chi phí"
                  className="pl-9 pr-14 h-12 bg-white border border-slate-200 focus-visible:ring-rose-500"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">VNĐ</span>
              </div>
            </div>

            {/* 4. Số lượng thành viên */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Số lượng thành viên</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={members}
                  onChange={(e) => setMembers(normalizePositiveIntegerInput(e.target.value))}
                  placeholder="Số người tối đa"
                  className="pl-9 h-12 bg-white border border-slate-200 focus-visible:ring-rose-500"
                />
              </div>
            </div>

          </div>

          {searchError && (
            <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {searchError}
            </p>
          )}

          {/* NÚT TÌM KIẾM ĐẶT RIÊNG BIỆT PHÍA DƯỚI */}
          <div className="mt-6">
            <Button type="submit" className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-md transition-all">
              <Search className="mr-2 h-5 w-5" /> Tìm kiếm ngay
            </Button>
          </div>

        </form>
      </div>

      {/* 3. BẢNG TIN CHUYẾN ĐI */}
      <div className="container mx-auto px-4 mt-16 max-w-6xl">
        <div className="flex justify-between items-end mb-8 border-b pb-4 border-slate-200">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Chuyến đi chưa bắt đầu</h2>
            <p className="text-slate-500 mt-1">Các hành trình đang mở từ database TripConnect.</p>
          </div>
          <Link href="/feed" className="text-blue-600 font-bold hover:underline hidden sm:block">
            Xem tất cả &rarr;
          </Link>
        </div>

        {tripsError && (
          <div className="mb-8 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
            {tripsError}
          </div>
        )}

        {isLoadingTrips ? (
          <div className="py-16 text-center text-slate-500">Đang tải chuyến đi...</div>
        ) : cardTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cardTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center font-medium text-slate-500">
            Hiện chưa có chuyến đi nào chưa bắt đầu.
          </div>
        )}

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
