"use client";

import React, { useState } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RatingMemberSheetProps {
    tripId: string;
    members: any[]; // Danh sách thành viên cần đánh giá
    children: React.ReactNode;
}

export default function RatingMemberSheet({ tripId, members, children }: RatingMemberSheetProps) {
    const [ratings, setRatings] = useState<Record<string, { stars: number, comment: string }>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRatingChange = (memberId: string, stars: number) => {
        setRatings(prev => ({ ...prev, [memberId]: { ...prev[memberId], stars } }));
    };

    const handleCommentChange = (memberId: string, comment: string) => {
        setRatings(prev => ({ ...prev, [memberId]: { ...prev[memberId], comment } }));
    };

    const handleSubmit = async (memberId: string) => {
        setIsSubmitting(true);
        /* ==========================================
           BÀN GIAO CHO BẢO: GỌI API SUBMIT REVIEW (UC-08c)
           POST /api/reviews
           Payload: { reviewee_id: memberId, trip_id: tripId, rating: ratings[memberId].stars, ... }
           Backend sẽ trả 409 Conflict nếu đã đánh giá rồi 
        ========================================== */
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Đã đánh giá thành viên ${memberId}:`, ratings[memberId]);
        setIsSubmitting(false);
    };

    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full sm:max-w-md bg-slate-50 overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>Đánh giá chuyến đi</SheetTitle>
                </SheetHeader>

                <div className="space-y-6">
                    {members.map((member) => (
                        <div key={member.id} className="bg-white p-4 rounded-2xl border shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Avatar><AvatarFallback>{member.avatar}</AvatarFallback></Avatar>
                                <div>
                                    <h4 className="font-bold text-sm">{member.name}</h4>
                                    <p className="text-xs text-slate-500">Trust Score: {member.trustScore}</p>
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div className="flex gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-6 w-6 cursor-pointer ${(ratings[member.id]?.stars || 0) >= star ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                                        onClick={() => handleRatingChange(member.id, star)}
                                    />
                                ))}
                            </div>

                            <Textarea
                                placeholder="Nhận xét về thành viên này (tùy chọn)..."
                                className="mb-3 text-sm"
                                onChange={(e) => handleCommentChange(member.id, e.target.value)}
                            />

                            <Button
                                className="w-full"
                                onClick={() => handleSubmit(member.id)}
                                disabled={!ratings[member.id]?.stars || isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Gửi đánh giá
                            </Button>
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}