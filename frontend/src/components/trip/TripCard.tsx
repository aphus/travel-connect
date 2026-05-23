import React from 'react';
import Link from 'next/link';
import { Calendar, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// 1. Định nghĩa cấu trúc dữ liệu (Props) mà thẻ này sẽ nhận vào
export interface Trip {
    id: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    budget: string;
    currentMembers: number;
    maxMembers: number;
    imageUrl: string;
    leader: {
        name: string;
        avatarUrl?: string;
        trustScore: number;
    };
}

interface TripCardProps {
    trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
    // Logic kiểm tra nhóm đã đủ người chưa
    const isFull = trip.currentMembers >= trip.maxMembers;

    return (
        <Link href={`/trips/${trip.id}`} className="block h-full cursor-pointer hover:-translate-y-1 transition-transform duration-300">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border-slate-200">

                {/* ... (Toàn bộ code hiển thị ảnh, tiêu đề, ngày tháng, leader bên trong giữ nguyên y hệt như cũ) ... */}

                <div className="relative h-48 w-full bg-slate-100">
                    <img src={trip.imageUrl} alt={trip.title} className="object-cover w-full h-full" />
                    <Badge className="absolute top-3 right-3 bg-white/90 text-blue-600 hover:bg-white shadow-sm border-none">{trip.location}</Badge>
                </div>

                <CardContent className="p-5 flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 leading-tight">{trip.title}</h3>
                    <div className="space-y-2.5 text-sm text-slate-600 font-medium">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-1.5 rounded-md"><Calendar className="w-4 h-4 text-blue-600" /></div>
                            <span>{trip.startDate} - {trip.endDate}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-green-50 p-1.5 rounded-md"><DollarSign className="w-4 h-4 text-green-600" /></div>
                            <span>{trip.budget}</span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-50 p-1.5 rounded-md"><Users className="w-4 h-4 text-orange-600" /></div>
                                <span>{trip.currentMembers} / {trip.maxMembers} thành viên</span>
                            </div>
                            {isFull && <Badge variant="destructive" className="text-[10px]">Đã đủ người</Badge>}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="p-5 border-t bg-slate-50 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{trip.leader.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 leading-none mb-1">{trip.leader.name}</span>
                            <span className="text-xs font-medium text-slate-500">Trust Score: <span className="text-blue-600">{trip.leader.trustScore}</span></span>
                        </div>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-semibold" disabled={isFull}>
                        {isFull ? "Đã chốt" : "Tham gia"}
                    </Button>
                </CardFooter>

            </Card>
        </Link>
    );
}