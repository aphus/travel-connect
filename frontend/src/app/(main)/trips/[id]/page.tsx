"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TripDetail from "@/components/trip/TripDetail";
import { MapPin } from "lucide-react";
import {
  getTrip,
  getTripDestinationLabel,
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

  const tripDetailInfo = tripToDetailData(trip);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full h-[420px] md:h-[560px] mb-8 rounded-3xl overflow-hidden shadow-lg bg-slate-900 relative group">
        <img
          src={
            trip.coverUrl ||
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"
          }
          alt={tripDetailInfo.title}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 pointer-events-none">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-lg leading-tight">
            {tripDetailInfo.title}
          </h1>
          <div className="flex items-center gap-2 text-base md:text-lg font-medium text-slate-200">
            <MapPin className="h-5 w-5 text-rose-500" />
            {getTripDestinationLabel(trip)}
          </div>
        </div>
      </div>

      <TripDetail
        tripId={params.id}
        tripData={tripDetailInfo}
        relation={relation}
        onChanged={loadTrip}
      />
    </div>
  );
}
