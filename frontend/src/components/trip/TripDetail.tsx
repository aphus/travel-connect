"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, Users, Navigation } from "lucide-react";
import TripActionPanel from "./TripActionPanel";
import { getStoredAuthUser } from "@/services/auth";
import type { TripRelation } from "@/services/trips";


export default function TripDetail({ tripId, tripData, relation, onChanged }: { tripId: string, tripData: any, relation?: TripRelation | null, onChanged?: () => void }) {
    const currentUser = getStoredAuthUser();
    const isLeader = relation?.isLeader ?? currentUser?.id === tripData.leaderId;
    const isMember = relation?.isMember ?? false;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card className="p-8 rounded-3xl border-none shadow-sm">
                    <h1 className="text-3xl font-extrabold mb-6">{tripData.title}</h1>
                    <div className="grid grid-cols-1 gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-2 mb-8">
                        <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            {tripData.destination}
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            {tripData.startDate} - {tripData.endDate}
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                            {tripData.budget}
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3">
                            <Users className="h-4 w-4 text-orange-600" />
                            {tripData.currentMembers} / {tripData.maxMembers} thành viên
                        </div>
                    </div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Navigation className="text-blue-600" /> Mô tả lịch trình
                    </h2>
                    <p className="whitespace-pre-line text-slate-600 leading-relaxed">{tripData.description}</p>
                </Card>
            </div>

            <div className="lg:col-span-1">
                <TripActionPanel
                    trip={tripData}
                    isLeader={isLeader}
                    isMember={isMember}
                    joinStatus={relation?.joinStatus ?? null}
                    onChanged={onChanged}
                />
            </div>

        </div>
    );
}
