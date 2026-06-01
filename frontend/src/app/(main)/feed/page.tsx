"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, DollarSign, Users, TrendingUp, Star, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

function getQueryValue(params: URLSearchParams, primary: string, fallback?: string) {
    return params.get(primary) || (fallback ? params.get(fallback) : "") || "";
}

function TrendingSidebar() {
    const [destinations, setDestinations] = useState<{ destination: string; count: number }[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetch('http://localhost:8000/api/trips/trending/destinations')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setDestinations(data);
            })
            .catch(err => console.error("Lỗi lấy trending:", err));
    }, []);

    if (destinations.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-rose-500" />
                Trending Destinations
            </h3>
            <ul className="space-y-4">
                {destinations.map((item, index) => (
                    <li
                        key={index}
                        className="flex justify-between items-center group cursor-pointer"
                        onClick={() => {
                            const params = new URLSearchParams();
                            params.set("destination", item.destination);
                            router.push(`/feed?${params.toString()}`);
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-slate-400 font-bold text-sm w-4">{index + 1}</span>
                            <span className="font-semibold text-slate-700 group-hover:text-rose-600 transition-colors">
                                {item.destination}
                            </span>
                        </div>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                            {item.count} trips
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function TopLeadersSidebar() {
    const [leaders, setLeaders] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetch('http://localhost:8000/api/users/top/leaders')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setLeaders(data);
            })
            .catch(err => console.error("Lỗi lấy top leaders:", err));
    }, []);

    if (leaders.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Top Trusted Leaders
            </h3>
            <ul className="space-y-5">
                {leaders.map((leader) => (
                    <li
                        key={leader.id}
                        className="flex items-center gap-4 cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-all"
                        onClick={() => router.push(`/profile/${leader.id}`)}
                    >
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarImage src={leader.avatar_url || ""} />
                            <AvatarFallback className="font-bold bg-rose-100 text-rose-600">
                                {leader.full_name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-slate-800 text-sm leading-tight">{leader.full_name}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-slate-500">
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                {leader.trust_score}
                                <span className="mx-1">•</span>
                                {leader.tripsCreated} trips
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function FeedContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const minTripDate = getTomorrowDateInputValue();
    const queryString = searchParams.toString();

    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState("");
    const [budget, setBudget] = useState("");
    const [members, setMembers] = useState("");
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchError, setSearchError] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(queryString);

        setLocation(getQueryValue(params, "destination", "location"));
        setStartDate(getQueryValue(params, "startDate", "date"));
        setBudget(formatCurrencyInput(getQueryValue(params, "budget")));
        setMembers(normalizePositiveIntegerInput(getQueryValue(params, "maxMembers", "members")));
    }, [queryString]);

    useEffect(() => {
        let isActive = true;
        const params = new URLSearchParams(queryString);

        async function loadTrips() {
            setIsLoading(true);
            setError("");

            try {
                const result = await listTrips({
                    destination: getQueryValue(params, "destination", "location"),
                    startDate: getQueryValue(params, "startDate", "date"),
                    budget: getQueryValue(params, "budget"),
                    maxMembers: getQueryValue(params, "maxMembers", "members"),
                });

                if (isActive) {
                    setTrips(result);
                }
            } catch (loadError) {
                if (isActive) {
                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : "Không thể tải danh sách chuyến đi.",
                    );
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        loadTrips();

        return () => {
            isActive = false;
        };
    }, [queryString]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchError("");

        const trimmedLocation = location.trim();
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
        if (trimmedLocation) params.set("destination", trimmedLocation);
        if (startDate) params.set("startDate", startDate);
        if (parsedBudget) params.set("budget", String(parsedBudget));
        if (parsedMembers) params.set("maxMembers", String(parsedMembers));

        const nextQuery = params.toString();
        router.push(nextQuery ? `/feed?${nextQuery}` : "/feed");
    };

    const cardTrips = trips.map(tripToCardData);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Khám phá chuyến đi</h1>
                <p className="text-slate-500">
                    Tìm kiếm và ghép nhóm với những người bạn đồng hành tuyệt vời trên mọi nẻo đường.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-8">

                    <form onSubmit={handleSearch} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Địa điểm</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Nhập gần đúng: ha, da lat..."
                                        className="pl-9 h-12 bg-white border border-slate-200 focus-visible:ring-rose-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Ngày mong muốn</label>
                                <Input
                                    type="date"
                                    min={minTripDate}
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="h-12 bg-white border border-slate-200 focus-visible:ring-rose-500 text-slate-600"
                                />
                            </div>

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

                        <div className="mt-6">
                            <Button type="submit" className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-md transition-all">
                                <Search className="mr-2 h-5 w-5" /> Tìm kiếm ngay
                            </Button>
                        </div>
                    </form>

                    {error && (
                        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="py-16 text-center text-slate-500">Đang tải chuyến đi...</div>
                    ) : cardTrips.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {cardTrips.map((trip) => (
                                <TripCard key={trip.id} trip={trip} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center text-slate-500">
                            Không tìm thấy chuyến đi nào khớp với bộ lọc hiện tại.
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 hidden lg:block">
                    <TrendingSidebar />
                    <TopLeadersSidebar />
                </div>

            </div>
        </div>
    );
}

export default function FeedPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Đang tải bảng tin...</div>}>
            <FeedContent />
        </Suspense>
    );
}
