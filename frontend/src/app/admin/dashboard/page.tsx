"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Map, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { getAllUsers, getAllTrips, getAllReports, AdminReport } from "@/services/admin";

import DashboardChart from "@/components/admin/dashboard/DashboardChart";
import RecentActivities, { Activity } from "@/components/admin/dashboard/RecentActivities";

export default function AdminDashboardPage() {
    const [statsData, setStatsData] = useState({ users: 0, trips: 0, reports: 0 });
    const [chartData, setChartData] = useState<any[]>([]);
    const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
    const [reportsList, setReportsList] = useState<AdminReport[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isReportViewed, setIsReportViewed] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [users, trips, reports] = await Promise.all([
                    getAllUsers().catch(() => []),
                    getAllTrips().catch(() => []),
                    getAllReports().catch(() => [])
                ]);

                const safeUsers = Array.isArray(users) ? users : [];
                const safeTrips = Array.isArray(trips) ? trips : [];
                const safeReports = Array.isArray(reports) ? reports : [];

                setStatsData({
                    users: safeUsers.length,
                    trips: safeTrips.length,
                    reports: safeReports.length,
                });
                setReportsList(safeReports);

                // --- XỬ LÝ DỮ LIỆU BIỂU ĐỒ (7 NGÀY QUA) ---
                const last7Days = Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d;
                });

                const newChartData = last7Days.map(date => {
                    const dateString = date.toISOString().split('T')[0];
                    const displayDate = `${date.getDate()}/${date.getMonth() + 1}`;

                    return {
                        name: displayDate,
                        "Người dùng mới": safeUsers.filter((u: any) => (u.createdAt || u.created_at)?.startsWith(dateString)).length,
                        "Chuyến đi mới": safeTrips.filter((t: any) => t.createdAt?.startsWith(dateString)).length || safeTrips.filter((t: any) => t.startDate?.startsWith(dateString)).length,
                    };
                });
                setChartData(newChartData);

                // --- XỬ LÝ HOẠT ĐỘNG GẦN ĐÂY ---
                const activities: Activity[] = [];
                safeUsers.forEach((u: any) => {
                    const userDate = u.createdAt || u.created_at;
                    const userName = u.fullName || u.full_name || u.email;
                    if (userDate) {
                        activities.push({ id: `u-${u.id}`, type: 'user', title: `Người dùng mới: ${userName}`, time: new Date(userDate) });
                    }
                });

                safeTrips.forEach((t: any) => {
                    const timeRef = t.createdAt || t.startDate;
                    if (timeRef) {
                        activities.push({ id: `t-${t.id}`, type: 'trip', title: `Chuyến đi mới: ${t.destination}`, time: new Date(timeRef) });
                    }
                });

                activities.sort((a, b) => b.time.getTime() - a.time.getTime());
                setRecentActivities(activities.slice(0, 5));

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const stats = [
        { title: "Tổng Người dùng", value: statsData.users, icon: Users, color: "text-blue-600", bg: "bg-blue-100", href: "/admin/users" },
        { title: "Tổng Chuyến đi", value: statsData.trips, icon: Map, color: "text-emerald-600", bg: "bg-emerald-100", href: "/admin/trips" },
        { title: "Báo cáo vi phạm", value: statsData.reports, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-100", href: "/admin/reports", isReport: true },
        { title: "Lượt truy cập (Tuần)", value: "349", icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-100" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard</h2>
                <p className="text-slate-500 mt-1">Tổng quan tình hình hoạt động của hệ thống</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;

                    const CardContent = (
                        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all duration-300 relative overflow-hidden ${(stat.href || stat.isReport) ? 'hover:-translate-y-1 hover:shadow-md hover:border-blue-200 cursor-pointer group' : ''}`}>
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                </div>
                            )}
                            {stat.isReport && statsData.reports > 0 && !isReportViewed && (
                                <span className="absolute top-4 right-4 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                </span>
                            )}
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 ${(stat.href || stat.isReport) ? 'group-hover:scale-110' : ''} ${stat.bg}`}>
                                <Icon className={`w-7 h-7 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
                                <p className="text-2xl font-black text-slate-800">
                                    {isLoading ? "-" : stat.value}
                                </p>
                            </div>
                        </div>
                    );

                    if (stat.href) {
                        return (
                            <Link
                                href={stat.href} key={index}
                                className="block focus:outline-none rounded-2xl"
                                onClick={() => stat.isReport && setIsReportViewed(true)}
                            >
                                {CardContent}
                            </Link>
                        );
                    }

                    return <div key={index}>{CardContent}</div>;
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DashboardChart isLoading={isLoading} chartData={chartData} />
                <RecentActivities isLoading={isLoading} activities={recentActivities} />
            </div>

        </div>
    );
}