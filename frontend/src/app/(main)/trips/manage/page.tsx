"use client";

import React from "react";
import {
    Edit, Users, CheckCircle2, Clock, XCircle, MapPin, Navigation, Ban
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

// MOCK DATA (Đã chỉnh sửa để test logic thời gian)
const MY_CREATED_TRIPS = [
    {
        id: "1", title: "Khám phá Đà Lạt 3N2Đ: Săn mây và cắm trại", location: "Đà Lạt", startDate: "25/06/2026", // Tương lai
        status: "Đang mở", currentMembers: 3, maxMembers: 6, pendingRequests: 2,
    },
    {
        id: "2", title: "Phượt xe máy Hà Giang - Sông Nho Quế", location: "Hà Giang", startDate: "10/05/2026", // Quá khứ (Đã bắt đầu/hoàn thành)
        status: "Đã chốt", currentMembers: 10, maxMembers: 10, pendingRequests: 0,
    },
    {
        id: "3", title: "Cắm trại hồ Trị An cuối tuần", location: "Đồng Nai", startDate: "15/07/2026",
        status: "Đã hủy", currentMembers: 0, maxMembers: 5, pendingRequests: 0, // Đã hủy
    }
];

const MY_JOINED_TRIPS = [
    { id: "4", title: "Trekking Tà Năng - Phan Dũng", leader: "Tuấn Anh", startDate: "02/07/2026", joinStatus: "Đã duyệt" },
    { id: "5", title: "Nghỉ dưỡng Cát Bà cuối tuần", leader: "Hải Đăng", startDate: "18/07/2026", joinStatus: "Đang chờ" },
    { id: "6", title: "Food tour phố cổ Hội An", leader: "Phương Ly", startDate: "05/09/2026", joinStatus: "Từ chối" }
];

export default function ManageTripsPage() {
    // Lấy thời gian hiện tại để so sánh
    const currentDate = new Date();

    // Hàm helper để so sánh ngày (Chuyển đổi dd/mm/yyyy sang Date object)
    const isTripInPast = (dateStr: string) => {
        const [day, month, year] = dateStr.split('/');
        const tripDate = new Date(`${year}-${month}-${day}`);
        return tripDate < currentDate;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">

            {/* BANNER HEADER */}
            <div className="relative w-full h-[30vh] bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent" />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg relative w-fit mx-auto">
                        <Navigation className="h-10 w-10 text-orange-400 absolute -left-12 top-1/2 -translate-y-1/2" />
                        Trung tâm điều hành
                    </h1>
                    <p className="text-lg text-slate-200 font-medium max-w-2xl mx-auto drop-shadow-md">
                        Quản lý các hành trình bạn đã tạo và theo dõi tiến độ ghép nhóm của bạn.
                    </p>
                </div>
            </div>

            {/* NỘI DUNG CHÍNH */}
            <div className="container mx-auto px-4 -mt-12 relative z-20 max-w-6xl">
                <Tabs defaultValue="created" className="w-full">

                    <div className="flex justify-center mb-8">
                        <TabsList className="grid w-full max-w-md grid-cols-2 h-14 bg-white shadow-md rounded-full border border-slate-100 p-1">
                            <TabsTrigger value="created" className="text-base font-bold rounded-full h-full data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all">
                                Chuyến đi tôi tạo
                            </TabsTrigger>
                            <TabsTrigger value="joined" className="text-base font-bold rounded-full h-full data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                                Chuyến đi tham gia
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* TAB 1: VAI TRÒ LEADER */}
                    <TabsContent value="created" className="space-y-4">
                        <Card className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border-none overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50/80">
                                    <TableRow className="border-slate-100">
                                        <TableHead className="w-[45%] font-bold text-slate-700 py-4 pl-6">Thông tin chuyến đi</TableHead>
                                        <TableHead className="font-bold text-slate-700">Trạng thái</TableHead>
                                        <TableHead className="font-bold text-slate-700">Thành viên</TableHead>
                                        <TableHead className="text-right font-bold text-slate-700 pr-6">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {MY_CREATED_TRIPS.map((trip) => {
                                        // Logic tính toán trạng thái vô hiệu hóa nút bấm
                                        const isPast = isTripInPast(trip.startDate);
                                        const isCancelled = trip.status === "Đã hủy";
                                        const isActionDisabled = isPast || isCancelled;

                                        return (
                                            <TableRow key={trip.id} className={`hover:bg-orange-50/30 transition-colors border-slate-100 ${isCancelled ? "opacity-70 grayscale-[30%]" : ""}`}>
                                                <TableCell className="pl-6 py-5">
                                                    <div className={`font-extrabold mb-1.5 text-base ${isCancelled ? "text-slate-500 line-through" : "text-slate-900"}`}>
                                                        {trip.title}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                                                        <span className="flex items-center gap-1.5"><MapPin className={`h-4 w-4 ${isCancelled ? "text-slate-400" : "text-orange-400"}`} /> {trip.location}</span>
                                                        <span className="flex items-center gap-1.5"><Clock className={`h-4 w-4 ${isCancelled ? "text-slate-400" : "text-blue-400"}`} /> {trip.startDate}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {/* Đổi màu Badge tùy theo trạng thái */}
                                                    <Badge className={`
                            ${trip.status === "Đang mở" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : ""}
                            ${trip.status === "Đã chốt" ? "bg-slate-200 text-slate-600 hover:bg-slate-300" : ""}
                            ${trip.status === "Đã hủy" ? "bg-red-100 text-red-700 hover:bg-red-200" : ""}
                            border-none px-3 py-1 font-bold
                          `}>
                                                        {trip.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="text-sm font-bold text-slate-700">{trip.currentMembers} / {trip.maxMembers} <span className="font-normal text-slate-500">người</span></span>
                                                        {trip.pendingRequests > 0 && !isCancelled && !isPast && (
                                                            <span className="text-xs text-orange-600 font-bold flex items-center gap-1 bg-orange-100 w-fit px-2 py-0.5 rounded-md">
                                                                <Users className="h-3 w-3" /> +{trip.pendingRequests} đang chờ
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={isActionDisabled}
                                                            className="h-9 border-orange-200 text-orange-700 hover:bg-orange-50 font-bold disabled:opacity-50"
                                                        >
                                                            Duyệt đơn
                                                        </Button>

                                                        {/* Nút Edit */}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={isActionDisabled}
                                                            title={isActionDisabled ? "Không thể sửa chuyến đi đã hủy hoặc đã bắt đầu" : "Sửa thông tin"}
                                                            className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>

                                                        {/* Nút Cancel (Thay thế cho nút Xóa cũ) */}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={isActionDisabled}
                                                            title={isActionDisabled ? "Không thể thao tác" : "Hủy chuyến đi"}
                                                            className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <Ban className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    {/* TAB 2: VAI TRÒ MEMBER (Giữ nguyên) */}
                    <TabsContent value="joined" className="space-y-4">
                        {/* ... (Phần code hiển thị chuyến đi tham gia giữ nguyên như cũ) ... */}
                        <Card className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border-none overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50/80">
                                    <TableRow className="border-slate-100">
                                        <TableHead className="w-[50%] font-bold text-slate-700 py-4 pl-6">Tên chuyến đi</TableHead>
                                        <TableHead className="font-bold text-slate-700">Leader</TableHead>
                                        <TableHead className="font-bold text-slate-700">Trạng thái duyệt</TableHead>
                                        <TableHead className="text-right font-bold text-slate-700 pr-6">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {MY_JOINED_TRIPS.map((trip) => (
                                        <TableRow key={trip.id} className="hover:bg-blue-50/30 transition-colors border-slate-100">
                                            <TableCell className="pl-6 py-5">
                                                <div className="font-extrabold text-slate-900 mb-1.5 text-base">{trip.title}</div>
                                                <div className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4 text-blue-400" /> Khởi hành: {trip.startDate}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-bold text-slate-700 flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600">{trip.leader.charAt(0)}</div>
                                                    {trip.leader}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {trip.joinStatus === "Đã duyệt" && (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-none flex w-fit gap-1 items-center px-3 py-1 font-bold hover:bg-emerald-200">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Đã duyệt
                                                    </Badge>
                                                )}
                                                {trip.joinStatus === "Đang chờ" && (
                                                    <Badge className="bg-amber-100 text-amber-700 border-none flex w-fit gap-1 items-center px-3 py-1 font-bold hover:bg-amber-200">
                                                        <Clock className="h-3.5 w-3.5" /> Đang chờ
                                                    </Badge>
                                                )}
                                                {trip.joinStatus === "Từ chối" && (
                                                    <Badge className="bg-rose-100 text-rose-700 border-none flex w-fit gap-1 items-center px-3 py-1 font-bold hover:bg-rose-200">
                                                        <XCircle className="h-3.5 w-3.5" /> Bị từ chối
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                {trip.joinStatus === "Đã duyệt" ? (
                                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 font-bold shadow-md">
                                                        Vào nhóm Chat
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline" size="sm" className="h-9 text-rose-500 hover:bg-rose-50 hover:text-rose-600 border-rose-200 font-bold">
                                                        Hủy yêu cầu
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </div>
    );
}