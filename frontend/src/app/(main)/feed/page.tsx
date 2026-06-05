"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, DollarSign, Users, TrendingUp, Star, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TripCard from "@/components/trip/TripCard";
import { TripSearchDestinationPicker } from "@/components/trip/TripSearchDestinationPicker";
import {
    formatCurrencyInput,
    getTomorrowDateInputValue,
    normalizePositiveIntegerInput,
    parseCurrencyInput,
    parsePositiveIntegerInput,
} from "@/lib/trip-format";
import { getMyJoinedTrips, listTrips, tripToCardData, type Trip } from "@/services/trips";
import { getAccessToken } from "@/services/fetchWrapper";

function getQueryValue(params: URLSearchParams, primary: string, fallback?: string) {
    return params.get(primary) || (fallback ? params.get(fallback) : "") || "";
}

type TopLeader = {
    id: string;
    avatar_url?: string | null;
    full_name?: string | null;
    trust_score?: number | string;
    tripsCreated?: number | string;
};

type SearchOverrides = Partial<{
    location: string;
    destinationPlace: string;
    startDate: string;
    budget: string;
    members: string;
}>;

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
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <TrendingUp className="h-4 w-4 text-rose-500" />
                Trending Destinations
            </h3>
            <ul className="space-y-2.5">
                {destinations.map((item, index) => (
                    <li
                        key={index}
                        className="group flex cursor-pointer items-center justify-between gap-3 rounded-lg px-1 py-1 transition-colors hover:bg-slate-50"
                        onClick={() => {
                            const params = new URLSearchParams();
                            params.set("destination", item.destination);
                            router.push(`/feed?${params.toString()}`);
                        }}
                    >
                        <div className="flex min-w-0 items-center gap-2">
                            <span className="w-4 shrink-0 text-xs font-bold text-slate-400">{index + 1}</span>
                            <span className="truncate text-sm font-semibold text-slate-700 transition-colors group-hover:text-rose-600">
                                {item.destination}
                            </span>
                        </div>
                        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500">
                            {item.count} trips
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function TopLeadersSidebar() {
    const [leaders, setLeaders] = useState<TopLeader[]>([]);
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
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <Award className="h-4 w-4 text-amber-500" />
                Top Trusted Leaders
            </h3>
            <ul className="space-y-3">
                {leaders.map((leader) => (
                    <li
                        key={leader.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg p-1.5 transition-all hover:bg-slate-50"
                        onClick={() => router.push(`/profile/${leader.id}`)}
                    >
                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                            <AvatarImage src={leader.avatar_url || ""} />
                            <AvatarFallback className="bg-rose-100 text-xs font-bold text-rose-600">
                                {leader.full_name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold leading-tight text-slate-800">{leader.full_name}</p>
                            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
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
    const [destinationPlace, setDestinationPlace] = useState("");
    const [startDate, setStartDate] = useState("");
    const [budget, setBudget] = useState("");
    const [members, setMembers] = useState("");
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchError, setSearchError] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(queryString);
        const nextProvince = getQueryValue(params, "destination", "location");

        const timer = window.setTimeout(() => {
            setLocation(nextProvince);
            setDestinationPlace(
                nextProvince
                    ? getQueryValue(params, "destinationPlace", "destination_place")
                    : "",
            );
            setStartDate(getQueryValue(params, "startDate", "date"));
            setBudget(formatCurrencyInput(getQueryValue(params, "budget")));
            setMembers(normalizePositiveIntegerInput(getQueryValue(params, "maxMembers", "members")));
        }, 0);

        return () => window.clearTimeout(timer);
    }, [queryString]);

    useEffect(() => {
        let isActive = true;
        const params = new URLSearchParams(queryString);
        const queryProvince = getQueryValue(params, "destination", "location");
        const queryDestinationPlace = queryProvince
            ? getQueryValue(params, "destinationPlace", "destination_place")
            : "";

        async function loadTrips() {
            setIsLoading(true);
            setError("");

            try {
                const result = await listTrips({
                    destination: queryProvince,
                    destinationPlace: queryDestinationPlace,
                    startDate: getQueryValue(params, "startDate", "date"),
                    budget: getQueryValue(params, "budget"),
                    maxMembers: getQueryValue(params, "maxMembers", "members"),
                });
                let tripsWithJoinStatus = result;

                if (getAccessToken()) {
                    const joinedTrips = await getMyJoinedTrips().catch(() => [] as Trip[]);
                    const joinStatusByTripId = new Map(
                        joinedTrips.map((trip) => [trip.id, trip.joinStatus]),
                    );

                    tripsWithJoinStatus = result.map((trip) => ({
                        ...trip,
                        joinStatus: joinStatusByTripId.get(trip.id) ?? trip.joinStatus,
                    }));
                }

                if (isActive) {
                    setTrips(tripsWithJoinStatus);
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

    const runSearch = (overrides: SearchOverrides = {}) => {
        setSearchError("");

        const nextLocation = overrides.location ?? location;
        const nextDestinationPlace = overrides.destinationPlace ?? destinationPlace;
        const nextStartDate = overrides.startDate ?? startDate;
        const nextBudget = overrides.budget ?? budget;
        const nextMembers = overrides.members ?? members;
        const trimmedLocation = nextLocation.trim();
        const trimmedDestinationPlace = nextDestinationPlace.trim();
        const parsedBudget = parseCurrencyInput(nextBudget);
        const parsedMembers = parsePositiveIntegerInput(nextMembers);

        if (nextStartDate && nextStartDate < minTripDate) {
            setSearchError("Ngày khởi hành phải từ ngày mai trở đi.");
            return false;
        }

        if (nextBudget && (!parsedBudget || parsedBudget <= 0)) {
            setSearchError("Ngân sách phải lớn hơn 0.");
            return false;
        }

        if (nextMembers && (!parsedMembers || parsedMembers <= 0)) {
            setSearchError("Số lượng thành viên phải lớn hơn 0.");
            return false;
        }

        const params = new URLSearchParams();
        if (trimmedLocation) params.set("destination", trimmedLocation);
        if (trimmedDestinationPlace) params.set("destinationPlace", trimmedDestinationPlace);
        if (nextStartDate) params.set("startDate", nextStartDate);
        if (parsedBudget) params.set("budget", String(parsedBudget));
        if (parsedMembers) params.set("maxMembers", String(parsedMembers));

        const nextQuery = params.toString();
        router.push(nextQuery ? `/feed?${nextQuery}` : "/feed");
        return true;
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        runSearch();
    };

    const handleProvinceChange = (nextProvince: string) => {
        setLocation(nextProvince);
        setDestinationPlace("");
        runSearch({ location: nextProvince, destinationPlace: "" });
    };

    const handleDestinationPlaceChange = (nextDestinationPlace: string) => {
        setDestinationPlace(nextDestinationPlace);
        runSearch({ destinationPlace: nextDestinationPlace });
    };

    const handleStartDateChange = (nextStartDate: string) => {
        setStartDate(nextStartDate);
        runSearch({ startDate: nextStartDate });
    };

    const handleBudgetKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        runSearch({ budget: event.currentTarget.value });
    };

    const handleMembersKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        runSearch({ members: event.currentTarget.value });
    };

    const cardTrips = trips.map(tripToCardData);

    return (
        <div className="container mx-auto max-w-7xl px-4 py-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">

                <div className="space-y-6">

                    <form
                        onSubmit={handleSearch}
                        className="sticky top-16 z-30 rounded-xl border border-slate-200 bg-white/95 p-2.5 shadow-sm backdrop-blur"
                    >
                        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-[minmax(185px,1fr)_minmax(205px,1.05fr)_142px_126px_112px_48px] lg:items-center">
                            <TripSearchDestinationPicker
                                province={location}
                                destinationPlace={destinationPlace}
                                onProvinceChange={handleProvinceChange}
                                onDestinationPlaceChange={handleDestinationPlaceChange}
                                className="gap-2.5 md:col-span-2 md:grid-cols-2 lg:col-span-2"
                                compact
                            />

                            <div>
                                <Input
                                    aria-label="Ngày mong muốn"
                                    type="date"
                                    min={minTripDate}
                                    value={startDate}
                                    onChange={(e) => handleStartDateChange(e.target.value)}
                                    className="h-11 border border-slate-200 bg-white text-sm text-slate-600 focus-visible:ring-rose-500"
                                />
                            </div>

                            <div>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        aria-label="Chi phí"
                                        inputMode="numeric"
                                        value={budget}
                                        onChange={(e) => setBudget(formatCurrencyInput(e.target.value))}
                                        onKeyDown={handleBudgetKeyDown}
                                        placeholder="Chi phí"
                                        className="h-11 border border-slate-200 bg-white pl-9 pr-10 text-sm focus-visible:ring-rose-500"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">VNĐ</span>
                                </div>
                            </div>

                            <div>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        aria-label="Số người"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={members}
                                        onChange={(e) => setMembers(normalizePositiveIntegerInput(e.target.value))}
                                        onKeyDown={handleMembersKeyDown}
                                        placeholder="Số người"
                                        className="h-11 border border-slate-200 bg-white pl-9 text-sm focus-visible:ring-rose-500"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                aria-label="Tìm kiếm"
                                title="Tìm kiếm"
                                className="h-11 w-full bg-rose-600 text-white shadow-md transition-all hover:bg-rose-700 lg:px-0"
                            >
                                <Search className="h-5 w-5 lg:mr-0" />
                                <span className="ml-2 font-bold lg:sr-only">Tìm</span>
                            </Button>
                        </div>

                        {searchError && (
                            <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                                {searchError}
                            </p>
                        )}
                    </form>

                    <div className="pt-1">
                        <h1 className="text-2xl font-extrabold text-slate-900">Khám phá chuyến đi</h1>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="py-16 text-center text-slate-500">Đang tải chuyến đi...</div>
                    ) : cardTrips.length > 0 ? (
                        <div className="mx-auto flex max-w-2xl flex-col gap-5">
                            {cardTrips.map((trip) => (
                                <TripCard key={trip.id} trip={trip} variant="feed" />
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center text-slate-500">
                            Không tìm thấy chuyến đi nào khớp với bộ lọc hiện tại.
                        </div>
                    )}
                </div>

                <div className="hidden lg:block">
                    <div className="sticky top-16 space-y-3">
                        <TrendingSidebar />
                        <TopLeadersSidebar />
                    </div>
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
