import React from "react";
import { Clock, Loader2, UserPlus, MapPin } from "lucide-react";

export interface Activity {
    id: string;
    type: 'user' | 'trip';
    title: string;
    time: Date;
}

interface RecentActivitiesProps {
    isLoading: boolean;
    activities: Activity[];
}

export default function RecentActivities({ isLoading, activities }: RecentActivitiesProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" /> Hoạt động gần đây
            </h3>

            <div className="space-y-5 flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                ) : activities.length > 0 ? (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 transition-all hover:translate-x-1">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${activity.type === 'user' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {activity.type === 'user' ? <UserPlus className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                            </div>
                            <div>
                                <p className="text-sm text-slate-700 font-medium line-clamp-2">{activity.title}</p>
                                <p className="text-xs text-slate-400 mt-1">{activity.time.toLocaleString('vi-VN')}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500 text-center py-10">Chưa có hoạt động nào gần đây.</p>
                )}
            </div>
        </div>
    );
}