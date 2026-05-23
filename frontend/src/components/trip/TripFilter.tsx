"use client";

import React from 'react';
import { Search, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TripFilter() {
    return (
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-3">

            {/* Ô nhập địa điểm */}
            <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                    placeholder="Bạn muốn đi đâu? (VD: Đà Lạt, Sapa...)"
                    className="pl-12 h-12 bg-slate-50/50 border-none text-base rounded-xl focus-visible:ring-1"
                />
            </div>

            {/* Cụm nút bộ lọc */}
            <div className="flex gap-3">
                <Button variant="outline" className="h-12 flex-1 md:flex-none gap-2 rounded-xl border-slate-200 text-slate-600">
                    <Calendar className="h-4 w-4" /> Ngày đi
                </Button>
                <Button variant="outline" className="h-12 flex-1 md:flex-none gap-2 rounded-xl border-slate-200 text-slate-600">
                    <DollarSign className="h-4 w-4" /> Ngân sách
                </Button>

                {/* Nút Tìm kiếm chính */}
                <Button className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-semibold">
                    <Search className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">Tìm kiếm</span>
                </Button>
            </div>
        </div>
    );
}