"use client";

import React, { useState } from "react";
// Đổi từ Sheet sang Dialog để hiện popup ở giữa
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import ReportUserDialog from "@/components/report/ReportUserDialog";
import { Flag } from "lucide-react";

// Import sẵn api wrapper (Đang comment để chờ nối Backend)
// import api from "@/services/api";

interface Member {
    id: string;
    name: string;
    avatar: string;
    trustScore: number;
}

interface RatingMemberProps {
    children: React.ReactNode;
    tripId: string;
    members: Member[];
}

export default function RatingMemberSheet({ children, tripId, members }: RatingMemberProps) {
    // Quản lý state đánh giá cho từng thành viên
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [comments, setComments] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

    const handleRatingChange = (memberId: string, star: number) => {
        setRatings((prev) => ({ ...prev, [memberId]: star }));
    };

    const handleCommentChange = (memberId: string, value: string) => {
        setComments((prev) => ({ ...prev, [memberId]: value }));
    };

    const handleSubmitRating = async (memberId: string) => {
        const score = ratings[memberId] || 0;
        const comment = comments[memberId] || "";

        if (score === 0) {
            alert("Vui lòng chọn số sao trước khi gửi đánh giá!");
            return;
        }

        /* ==========================================
           LOGIC KẾT NỐI BACKEND ĐÃ CHUẨN BỊ SẴN
           ========================================== */

        // setIsSubmitting((prev) => ({ ...prev, [memberId]: true }));
        // try {
        //     // Gọi API POST gửi đánh giá
        //     const response = await api.post(`/trips/${tripId}/ratings`, {
        //         targetUserId: memberId,
        //         score: score,
        //         comment: comment
        //     });
        //     
        //     if (response.status === 201 || response.status === 200) {
        //         alert("Gửi đánh giá thành công!");
        //         // Có thể thêm logic ẩn form của user này đi sau khi đánh giá xong
        //     }
        // } catch (error) {
        //     console.error("Lỗi khi gửi đánh giá:", error);
        //     alert("Có lỗi xảy ra, vui lòng thử lại sau!");
        // } finally {
        //     setIsSubmitting((prev) => ({ ...prev, [memberId]: false }));
        // }


        // Giả lập UI lúc chưa có Backend
        setIsSubmitting((prev) => ({ ...prev, [memberId]: true }));
        setTimeout(() => {
            alert(`Đã gửi đánh giá ${score} sao cho thành viên ${memberId}`);
            setIsSubmitting((prev) => ({ ...prev, [memberId]: false }));
        }, 800);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Đánh giá thành viên</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {members.map((member) => (
                        <div key={member.id} className="relative p-4 border rounded-xl shadow-sm bg-white">

                            <div className="absolute top-4 right-4">
                                <ReportUserDialog targetUserId={member.id} targetUserName={member.name}>
                                    <button
                                        className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                                        title="Báo cáo vi phạm"
                                    >
                                        <Flag className="w-5 h-5" />
                                    </button>
                                </ReportUserDialog>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <Avatar>
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                        {member.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-bold text-sm">{member.name}</h4>
                                    <p className="text-xs text-slate-500">Trust Score: <span className="text-amber-500 font-semibold">{member.trustScore}</span></p>
                                </div>
                            </div>

                            {/* Chấm sao */}
                            <div className="flex gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-6 h-6 cursor-pointer transition-colors ${(ratings[member.id] || 0) >= star
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-slate-300"
                                            }`}
                                        onClick={() => handleRatingChange(member.id, star)}
                                    />
                                ))}
                            </div>

                            <Textarea
                                placeholder="Nhận xét về thành viên này (tùy chọn)..."
                                className="mb-3 resize-none"
                                value={comments[member.id] || ""}
                                onChange={(e) => handleCommentChange(member.id, e.target.value)}
                            />

                            <Button
                                className="w-full bg-slate-900 hover:bg-slate-800"
                                onClick={() => handleSubmitRating(member.id)}
                                disabled={isSubmitting[member.id]}
                            >
                                {isSubmitting[member.id] ? "Đang gửi..." : "Gửi đánh giá"}
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}