"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TripDetail from "@/components/trip/TripDetail";
import {
    getTrip,
    getTripRelation,
    tripToDetailData,
    type Trip,
    type TripRelation,
} from "@/services/trips";
import { getAccessToken } from "@/services/fetchWrapper";

export default function TripPage() {
    const params = useParams<{ id: string }>();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [relation, setRelation] = useState<TripRelation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadTrip = useCallback(async () => {
        if (!params.id) return;

        setIsLoading(true);
        setError("");

        try {
            const [tripResult, relationResult] = await Promise.all([
                getTrip(params.id),
                getAccessToken()
                    ? getTripRelation(params.id).catch(() => null)
                    : Promise.resolve(null),
            ]);

            setTrip(tripResult);
            setRelation(relationResult);
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "Không thể tải chi tiết chuyến đi.",
            );
        } finally {
            setIsLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        let isActive = true;

        async function run() {
            if (isActive) {
                await loadTrip();
            }
        }

        void run();

        return () => {
            isActive = false;
        };
    }, [loadTrip]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center text-slate-500">
                Đang tải chi tiết chuyến đi...
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                    {error || "Không tìm thấy chuyến đi."}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* THÊM KHUNG HIỂN THỊ ẢNH BANNER Ở ĐÂY */}
            <div className="w-full h-[300px] md:h-[400px] mb-8 rounded-2xl overflow-hidden shadow-md bg-slate-100 relative">
                <img
                    src={trip.coverUrl || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"}
                    alt={trip.destination || "Banner chuyến đi"}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Component chi tiết chuyến đi cũ giữ nguyên */}
            <TripDetail
                tripId={params.id}
                tripData={tripToDetailData(trip)}
                relation={relation}
                onChanged={loadTrip}
            />
        </div>
    );
}
