"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Ban,
    CheckCircle2,
    Clock,
    Edit,
    Loader2,
    MapPin,
    Navigation,
    Star,
    Users,
    XCircle,
    PlusCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import ApprovalSheet from "@/components/trip/ApprovalSheet";
import CancelTripAction from "@/components/trip/CancelTripAction";
import LeaveTripAction from "@/components/trip/LeaveTripAction";
import ManageMembersSheet from "@/components/trip/ManageMembersSheet";
import RatingMemberSheet from "@/components/trip/RatingMemberSheet";
import { ApiError } from "@/services/fetchWrapper";
import {
    getMyCreatedTrips,
    getMyJoinedTrips,
    getTripDestinationLabel,
    getTripTitle,
    type JoinStatus,
    type Trip,
    type TripStatus,
} from "@/services/trips";
import { formatDisplayDate, getLocalDateInputValue } from "@/lib/trip-format";

type StatusFilterValue = "all" | TripStatus;
type DisplayJoinStatus = JoinStatus | "EXPIRED";

const TRIP_STATUS_META: Record<TripStatus, { label: string; className: string }> = {
    upcoming: {
        label: "Sắp diễn ra",
        className: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
    },
    ongoing: {
        label: "Đang diễn ra",
        className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    },
    awaiting_confirmation: {
        label: "Chờ xác nhận",
        className: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    },
    completed: {
        label: "Đã hoàn thành",
        className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
    },
    cancelled: {
        label: "Đã hủy",
        className: "bg-slate-200 text-slate-600 hover:bg-slate-300",
    },
};

const STATUS_FILTER_OPTIONS: Array<{ value: StatusFilterValue; label: string }> = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "upcoming", label: TRIP_STATUS_META.upcoming.label },
    { value: "ongoing", label: TRIP_STATUS_META.ongoing.label },
    { value: "awaiting_confirmation", label: TRIP_STATUS_META.awaiting_confirmation.label },
    { value: "completed", label: TRIP_STATUS_META.completed.label },
    { value: "cancelled", label: TRIP_STATUS_META.cancelled.label },
];

const JOIN_STATUS_META: Record<DisplayJoinStatus, { label: string; className: string; icon: React.ElementType }> = {
    APPROVED: {
        label: "Đã duyệt",
        className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
        icon: CheckCircle2,
    },
    PENDING: {
        label: "Đang chờ",
        className: "bg-amber-100 text-amber-700 hover:bg-amber-200",
        icon: Clock,
    },
    REJECTED: {
        label: "Bị từ chối",
        className: "bg-rose-100 text-rose-700 hover:bg-rose-200",
        icon: XCircle,
    },
    REMOVED: {
        label: "Bị xóa khỏi nhóm",
        className: "bg-red-100 text-red-700 hover:bg-red-200",
        icon: Ban,
    },
    LEFT: {
        label: "Đã rời nhóm",
        className: "bg-slate-100 text-slate-600 hover:bg-slate-200",
        icon: XCircle,
    },
    CANCELED: {
        label: "Đã hủy yêu cầu",
        className: "bg-slate-100 text-slate-600 hover:bg-slate-200",
        icon: XCircle,
    },
    EXPIRED: {
        label: "Quá hạn duyệt",
        className: "bg-slate-100 text-slate-600 hover:bg-slate-200",
        icon: Clock,
    },
};

function ManageTripsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [createdTrips, setCreatedTrips] = useState<Trip[]>([]);
    const [joinedTrips, setJoinedTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("created");
    const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
    const today = useMemo(() => getLocalDateInputValue(), []);
    const highlightedTripId = searchParams.get("tripId");

    const loadTrips = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const [created, joined] = await Promise.all([
                getMyCreatedTrips(),
                getMyJoinedTrips(),
            ]);

            setCreatedTrips(created);
            setJoinedTrips(joined);
        } catch (loadError) {
            if (loadError instanceof ApiError && loadError.status === 401) {
                router.push("/login");
                return;
            }

            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "Không thể tải danh sách chuyến đi của bạn.",
            );
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadTrips();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadTrips]);

    useEffect(() => {
        const tab = searchParams.get("tab");
        const timeoutId = window.setTimeout(() => {
            setActiveTab(tab === "joined" ? "joined" : "created");
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [searchParams]);

    const visibleCreatedTrips = useMemo(
        () => getFilteredSortedTrips(createdTrips, statusFilter, today),
        [createdTrips, statusFilter, today],
    );
    const visibleJoinedTrips = useMemo(
        () => getFilteredSortedTrips(joinedTrips, statusFilter, today),
        [joinedTrips, statusFilter, today],
    );
    const activeVisibleCount =
        activeTab === "created" ? visibleCreatedTrips.length : visibleJoinedTrips.length;
    const activeTotalCount =
        activeTab === "created" ? createdTrips.length : joinedTrips.length;
    const activeFilterLabel =
        STATUS_FILTER_OPTIONS.find((option) => option.value === statusFilter)?.label ??
        STATUS_FILTER_OPTIONS[0].label;

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <div className="relative w-full min-h-[36vh] pb-12 bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent" />
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
            </div>

            <div className="container mx-auto px-4 -mt-12 relative z-20 max-w-6xl">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

                    {highlightedTripId && (
                        <div className="mb-6 rounded-xl border border-orange-100 bg-orange-50 px-5 py-4 text-sm font-semibold text-orange-700">
                            Đã mở nhanh chuyến đi từ thông báo. Hàng tương ứng sẽ được làm nổi bật bên dưới.
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                            {error}
                        </div>
                    )}

                    {!isLoading && (
                        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="text-sm font-extrabold text-slate-800">Trạng thái chuyến</div>
                                <div className="text-xs font-semibold text-slate-500">
                                    Đang hiển thị {activeVisibleCount}/{activeTotalCount} chuyến
                                </div>
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => setStatusFilter(value as StatusFilterValue)}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white px-3 font-bold text-slate-700 sm:w-56">
                                    <SelectValue placeholder="Tất cả trạng thái" />
                                </SelectTrigger>
                                <SelectContent align="end" className="rounded-xl">
                                    {STATUS_FILTER_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Link href="/trips/create" className="w-full sm:w-auto">
                                <Button className="w-full sm:w-auto h-10 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-sm">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tạo chuyến đi
                                </Button>
                            </Link>
                        </div>
                    )}

                    {isLoading ? (
                        <Card className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border-none p-12">
                            <div className="flex items-center justify-center gap-3 text-slate-500 font-semibold">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Đang tải chuyến đi của bạn...
                            </div>
                        </Card>
                    ) : (
                        <>
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
                                            {createdTrips.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="py-12 text-center text-slate-500 font-medium">
                                                        Bạn chưa tạo chuyến đi nào.
                                                    </TableCell>
                                                </TableRow>
                                            ) : visibleCreatedTrips.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="py-12 text-center text-slate-500 font-medium">
                                                        Không có chuyến đi tôi tạo ở trạng thái {activeFilterLabel}.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                visibleCreatedTrips.map((trip) => {
                                                    const lifecycleStatus = getTripLifecycleStatus(trip, today);
                                                    const statusMeta = TRIP_STATUS_META[lifecycleStatus];
                                                    const isCancelled = lifecycleStatus === "cancelled";
                                                    const isCompleted = lifecycleStatus === "completed";
                                                    const isActionDisabled = lifecycleStatus !== "upcoming";
                                                    const hasPendingRequests = trip.pendingRequests > 0;

                                                    return (
                                                        <TableRow key={trip.id} className={`hover:bg-orange-50/30 transition-colors border-slate-100 ${isCancelled ? "opacity-70 grayscale-[30%]" : ""} ${highlightedTripId === trip.id ? "bg-orange-50 ring-1 ring-inset ring-orange-200" : ""}`}>
                                                            <TableCell className="pl-6 py-5">
                                                                <Link
                                                                    href={`/trips/${trip.id}`}
                                                                    className={`font-extrabold mb-1.5 text-base inline-block hover:text-blue-600 transition-colors ${isCancelled ? "text-slate-500 line-through" : "text-slate-900"}`}
                                                                >
                                                                    {getTripTitle(trip)}
                                                                </Link>
                                                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                                                                    <span className="flex items-center gap-1.5"><MapPin className={`h-4 w-4 ${isCancelled ? "text-slate-400" : "text-orange-400"}`} /> {getTripDestinationLabel(trip)}</span>
                                                                    <span className="flex items-center gap-1.5"><Clock className={`h-4 w-4 ${isCancelled ? "text-slate-400" : "text-blue-400"}`} /> {formatDisplayDate(trip.startDate)}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={`${statusMeta.className} border-none px-3 py-1 font-bold`}>
                                                                    {statusMeta.label}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col gap-1.5">
                                                                    <span className="text-sm font-bold text-slate-700">{trip.currentMembers} / {trip.maxMembers} <span className="font-normal text-slate-500">người</span></span>
                                                                    {hasPendingRequests && !isActionDisabled && (
                                                                        <span className="text-xs text-orange-600 font-bold flex items-center gap-1 bg-orange-100 w-fit px-2 py-0.5 rounded-md">
                                                                            <Users className="h-3 w-3" /> +{trip.pendingRequests} đang chờ
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right pr-6">
                                                                {isCompleted ? (
                                                                    <TripRatingAction tripId={trip.id} />
                                                                ) : (
                                                                    <div className="flex justify-end gap-2">
                                                                        <ApprovalSheet tripId={trip.id} onChanged={loadTrips}>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                disabled={isActionDisabled || !hasPendingRequests}
                                                                                className="h-9 border-orange-200 text-orange-700 hover:bg-orange-50 font-bold disabled:opacity-50"
                                                                            >
                                                                                Duyệt đơn
                                                                            </Button>
                                                                        </ApprovalSheet>

                                                                        <ManageMembersSheet tripId={trip.id} isLeader={true} onChanged={loadTrips}>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                title="Danh sách thành viên"
                                                                                className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                            >
                                                                                <Users className="h-4 w-4" />
                                                                            </Button>
                                                                        </ManageMembersSheet>

                                                                        {isActionDisabled ? (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                disabled
                                                                                title="Không thể sửa chuyến đi đã hủy hoặc đã bắt đầu"
                                                                                className="h-9 w-9 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                        ) : (
                                                                            <Link href={`/trips/${trip.id}/edit`}>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    title="Sửa thông tin"
                                                                                    className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                                                >
                                                                                    <Edit className="h-4 w-4" />
                                                                                </Button>
                                                                            </Link>
                                                                        )}

                                                                        <CancelTripAction tripId={trip.id} onSuccess={loadTrips}>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                disabled={isActionDisabled}
                                                                                title={isActionDisabled ? "Không thể thao tác" : "Hủy chuyến đi"}
                                                                                className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                                                            >
                                                                                <Ban className="h-4 w-4" />
                                                                            </Button>
                                                                        </CancelTripAction>
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </TabsContent>

                            <TabsContent value="joined" className="space-y-4">
                                <Card className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border-none overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-50/80">
                                            <TableRow className="border-slate-100">
                                                <TableHead className="w-[40%] font-bold text-slate-700 py-4 pl-6">Tên chuyến đi</TableHead>
                                                <TableHead className="font-bold text-slate-700">Leader</TableHead>
                                                <TableHead className="font-bold text-slate-700">Trạng thái chuyến</TableHead>
                                                <TableHead className="font-bold text-slate-700">Trạng thái duyệt</TableHead>
                                                <TableHead className="text-right font-bold text-slate-700 pr-6">Hành động</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {joinedTrips.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                                                        Bạn chưa tham gia chuyến đi nào.
                                                    </TableCell>
                                                </TableRow>
                                            ) : visibleJoinedTrips.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                                                        Không có chuyến đi tham gia ở trạng thái {activeFilterLabel}.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                visibleJoinedTrips.map((trip) => {
                                                    const lifecycleStatus = getTripLifecycleStatus(trip, today);
                                                    const statusMeta = TRIP_STATUS_META[lifecycleStatus];
                                                    const isCancelled = lifecycleStatus === "cancelled";
                                                    const isCompleted = lifecycleStatus === "completed";
                                                    const joinStatus = trip.joinStatus ?? "APPROVED";
                                                    const displayJoinStatus = getDisplayJoinStatus(joinStatus, lifecycleStatus);
                                                    const joinMeta = JOIN_STATUS_META[displayJoinStatus];
                                                    const StatusIcon = joinMeta.icon;
                                                    const leaderName = trip.leader?.fullName ?? "Leader";

                                                    return (
                                                        <TableRow key={`${trip.id}-${displayJoinStatus}`} className={`hover:bg-blue-50/30 transition-colors border-slate-100 ${isCancelled ? "opacity-60 grayscale-[35%]" : ""} ${highlightedTripId === trip.id ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : ""}`}>
                                                            <TableCell className="pl-6 py-5">
                                                                <Link
                                                                    href={`/trips/${trip.id}`}
                                                                    className={`font-extrabold mb-1.5 text-base inline-block hover:text-blue-600 transition-colors ${isCancelled ? "text-slate-500 line-through" : "text-slate-900"}`}
                                                                >
                                                                    {getTripTitle(trip)}
                                                                </Link>
                                                                <div className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                                                                    <Clock className={`h-4 w-4 ${isCancelled ? "text-slate-400" : "text-blue-400"}`} /> Khởi hành: {formatDisplayDate(trip.startDate)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="font-bold text-slate-700 flex items-center gap-2">
                                                                    <span className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600">{leaderName.charAt(0)}</span>
                                                                    {leaderName}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={`${statusMeta.className} border-none px-3 py-1 font-bold`}>
                                                                    {statusMeta.label}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={`${joinMeta.className} border-none flex w-fit gap-1 items-center px-3 py-1 font-bold`}>
                                                                    <StatusIcon className="h-3.5 w-3.5" /> {joinMeta.label}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right pr-6">
                                                                {isCompleted && joinStatus === "APPROVED" ? (
                                                                    <TripRatingAction tripId={trip.id} />
                                                                ) : displayJoinStatus === "EXPIRED" ? (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        disabled
                                                                        title="Yêu cầu tham gia đã hết hạn vì chuyến đi đã hoàn thành."
                                                                        className="h-9 border-slate-200 bg-slate-50 text-slate-500 opacity-100 font-bold cursor-not-allowed"
                                                                    >
                                                                        Đã hết hạn
                                                                    </Button>
                                                                ) : isCancelled ? (
                                                                    <Link href={`/trips/${trip.id}`}>
                                                                        <Button variant="outline" size="sm" className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold">
                                                                            Xem chi tiết
                                                                        </Button>
                                                                    </Link>
                                                                ) : joinStatus === "APPROVED" ? (
                                                                    <Link href={`/chat/${trip.id}`}>
                                                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 font-bold shadow-md">
                                                                            Vào nhóm Chat
                                                                        </Button>
                                                                    </Link>
                                                                ) : joinStatus === "PENDING" ? (
                                                                    <LeaveTripAction tripId={trip.id} status="PENDING" onSuccess={loadTrips}>
                                                                        <Button variant="outline" size="sm" className="h-9 text-rose-500 hover:bg-rose-50 hover:text-rose-600 border-rose-200 font-bold">
                                                                            Hủy yêu cầu
                                                                        </Button>
                                                                    </LeaveTripAction>
                                                                ) : joinStatus === "REJECTED" ? (
                                                                    <Button variant="outline" size="sm" disabled className="h-9 text-rose-600 border-rose-200 bg-rose-50 opacity-100 font-bold cursor-not-allowed">
                                                                        Không thể xin lại
                                                                    </Button>
                                                                ) : joinStatus === "REMOVED" ? (
                                                                    <Button variant="outline" size="sm" disabled className="h-9 text-red-600 border-red-200 bg-red-50 opacity-100 font-bold cursor-not-allowed">
                                                                        Đã bị xóa
                                                                    </Button>
                                                                ) : joinStatus === "LEFT" ? (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        disabled
                                                                        title="Bạn đã tự rời nhóm của chuyến đi này và không thể xin tham gia lại."
                                                                        className="h-9 text-slate-600 border-slate-200 bg-slate-50 opacity-100 font-bold cursor-not-allowed"
                                                                    >
                                                                        Đã rời nhóm
                                                                    </Button>
                                                                ) : (
                                                                    <Link href={`/trips/${trip.id}`}>
                                                                        <Button variant="outline" size="sm" className="h-9 text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-blue-200 font-bold">
                                                                            Xin lại
                                                                        </Button>
                                                                    </Link>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
        </div>
    );
}

function getDisplayJoinStatus(
    joinStatus: JoinStatus,
    lifecycleStatus: TripStatus,
): DisplayJoinStatus {
    if (lifecycleStatus === "completed" && joinStatus === "PENDING") {
        return "EXPIRED";
    }

    return joinStatus;
}

function TripRatingAction({ tripId }: { tripId: string }) {
    return (
        <RatingMemberSheet tripId={tripId}>
            <Button size="sm" className="h-9 bg-amber-500 text-white shadow-sm hover:bg-amber-600 font-bold">
                <Star className="mr-2 h-4 w-4 fill-white text-white" />
                Đánh giá
            </Button>
        </RatingMemberSheet>
    );
}

function getFilteredSortedTrips(
    trips: Trip[],
    statusFilter: StatusFilterValue,
    today: string,
) {
    return [...trips]
        .filter((trip) => {
            if (statusFilter === "all") return true;
            return getTripLifecycleStatus(trip, today) === statusFilter;
        })
        .sort((left, right) => {
            const statusDiff = getTripSortBucket(left, today) - getTripSortBucket(right, today);
            if (statusDiff !== 0) return statusDiff;

            const dateDiff = getTripDateSortValue(right) - getTripDateSortValue(left);
            if (dateDiff !== 0) return dateDiff;

            return getTripCreatedSortValue(right) - getTripCreatedSortValue(left);
        });
}

function getTripSortBucket(trip: Trip, today: string) {
    const lifecycleStatus = getTripLifecycleStatus(trip, today);

    if (lifecycleStatus === "completed") return 3;
    if (lifecycleStatus === "cancelled") return 2;
    if (lifecycleStatus === "awaiting_confirmation") return 1;
    if (trip.startDate && trip.startDate <= today) return 1;

    return 0;
}

function getTripLifecycleStatus(trip: Trip, today: string): TripStatus {
    if (
        trip.status === "cancelled" ||
        trip.status === "completed" ||
        trip.status === "awaiting_confirmation"
    ) {
        return trip.status;
    }

    if (!trip.startDate) {
        return trip.status;
    }

    if (trip.startDate > today) return "upcoming";
    return "ongoing";
}

function getTripDateSortValue(trip: Trip) {
    return Date.parse(trip.startDate || "") || getTripCreatedSortValue(trip);
}

function getTripCreatedSortValue(trip: Trip) {
    return Date.parse(trip.createdAt || "") || 0;
}

export default function ManageTripsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Đang tải trung tâm điều hành...</div>}>
            <ManageTripsContent />
        </Suspense>
    );
}
