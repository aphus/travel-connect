"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";

const DESTINATIONS = [
    "Hà Nội", "TP Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "An Giang",
    "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre",
    "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng",
    "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai",
    "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
    "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng",
    "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình",
    "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi",
    "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình",
    "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh",
    "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

export default function DestinationsCarousel() {
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const handleLocationClick = (name: string) => {
        router.push(`/feed?destination=${name}`);
    };

    return (
        <div className="mb-12 relative group">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Điểm đến phổ biến</h2>

            <button onClick={() => scroll('left')} className="absolute -left-4 top-[40%] z-20 p-2 bg-white rounded-full shadow-lg border border-slate-200 hidden group-hover:block transition-all hover:bg-slate-50">
                <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>

            <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-8 w-full scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {DESTINATIONS.map((province, index) => (
                    <div
                        key={index}
                        onClick={() => handleLocationClick(province)}
                        className="flex-none w-[200px] h-[280px] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:scale-105 transition-transform duration-300 relative"
                    >
                        <img
                            src={`https://picsum.photos/seed/${province}/400/600`}
                            alt={province}
                            className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-lg font-bold text-white truncate">{province}</h3>
                            <p className="text-xs text-slate-300 flex items-center gap-1"><MapPin className="w-3 h-3" /> Khám phá</p>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={() => scroll('right')} className="absolute -right-4 top-[40%] z-20 p-2 bg-white rounded-full shadow-lg border border-slate-200 hidden group-hover:block transition-all hover:bg-slate-50">
                <ChevronRight className="w-6 h-6 text-slate-600" />
            </button>
        </div>
    );
}