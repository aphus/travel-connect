"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, Users, Navigation } from "lucide-react";
import TripCompletionAction from "./TripCompletionAction";
import JoinTripButton from "./JoinTripButton";

export default function TripDetail({ tripId, tripData }: { tripId: string, tripData: any }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột trái: Nội dung */}
            <div className="lg:col-span-2">
                <Card className="p-8 rounded-3xl border-none shadow-sm">
                    <h1 className="text-3xl font-extrabold mb-6">{tripData.title}</h1>
                    <div className="flex flex-wrap gap-4 mb-8">
                        {/* Các badge thông tin... */}
                    </div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Navigation className="text-blue-600" /> Mô tả lịch trình
                    </h2>
                    <p className="text-slate-600 leading-relaxed">{tripData.description}</p>
                </Card>
            </div>

            {/* Cột phải: Sidebar hành động */}
            <div className="lg:col-span-1">
                <Card className="p-6 rounded-3xl shadow-sm border sticky top-24">
                    <h3 className="font-bold mb-4">Người dẫn đoàn</h3>
                    <div className="space-y-4">
                        <TripCompletionAction tripId={tripId} initialStatus="ONGOING" isLeader={true} />
                        <JoinTripButton tripId={tripId} initialStatus="NONE" />
                    </div>
                </Card>
            </div>
        </div>
    );
}