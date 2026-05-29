"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, Users, Navigation } from "lucide-react";
import TripActionPanel from "./TripActionPanel";


export default function TripDetail({ tripId, tripData }: { tripId: string, tripData: any }) {

    // BƯỚC 2: Tạo biến giả lập (Mock) phân quyền để test giao diện
    // (Sau này khi nối Backend, ta sẽ lấy từ Context/Redux)
    const isLeader = false;   // Đổi thành false để test góc nhìn thành viên
    const isMember = true;  // Đổi thành false, isLeader = false để test góc nhìn người lạ (Guest)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột trái: Nội dung (Giữ nguyên) */}
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
            {/* <div className="lg:col-span-1"> */}
            {/* BƯỚC 3: Dùng duy nhất TripActionPanel và truyền props vào */}
            {/* <TripActionPanel
                    trip={tripData}
                    isLeader={isLeader}
                    isMember={isMember}
                />
            </div> */}

            {/* Cột phải: Sidebar hành động */}
            <div className="lg:col-span-1">
                {/* Ép dữ liệu giả để test UI */}
                <TripActionPanel
                    trip={{
                        ...tripData,
                        id: tripData.id || tripId,
                        status: tripData.status || "UPCOMING",
                        leader: tripData.leader || {
                            name: "Đình Thạch",
                            trustScore: 99,
                            avatar: ""
                        },
                    }}
                    isLeader={isLeader}
                    isMember={isMember}
                />
            </div>

        </div>
    );
}
