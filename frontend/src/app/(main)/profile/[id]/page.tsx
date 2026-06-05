"use client";

import { type ElementType, type ReactNode, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Award,
  Calendar,
  CheckCircle2,
  FolderPlus,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import RatingStars from "@/components/review/RatingStars";
import UserReviews from "@/components/review/UserReviews";
import TripCard from "@/components/trip/TripCard";
import { ApiError } from "@/services/fetchWrapper";
import { getUserReviews, type UserReview } from "@/services/reviews";
import {
  getUserCreatedTrips,
  getUserJoinedTrips,
  tripToCardData,
  type Trip,
} from "@/services/trips";
import { getUserProfile, type PublicUser } from "@/services/users";

type ProfileTab = "about" | "upcoming" | "reviews" | "created" | "completed";

export default function PublicProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [tripsCompletedCount, setTripsCompletedCount] = useState(0);
  const [tripsCreatedCount, setTripsCreatedCount] = useState(0);
  const [createdTripsList, setCreatedTripsList] = useState<Trip[]>([]);
  const [completedTripsList, setCompletedTripsList] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ProfileTab>("about");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setError("");

      try {
        const profile = await getUserProfile(params.id);
        const [userReviews, createdTripsResult, joinedTripsResult] =
          await Promise.all([
            getUserReviews(params.id).catch(() => [] as UserReview[]),
            getUserCreatedTrips(params.id).catch(() => null),
            getUserJoinedTrips(params.id).catch(() => null),
          ]);

        if (!isMounted) return;

        const createdTrips = createdTripsResult ?? [];
        const joinedTrips = joinedTripsResult ?? [];
        const uniqueTrips = Array.from(
          new Map(
            [...createdTrips, ...joinedTrips].map((trip) => [trip.id, trip]),
          ).values(),
        );
        const upcomingTripsList = uniqueTrips
          .filter(
            (trip) => trip.status === "upcoming" || trip.status === "ongoing",
          )
          .sort(
            (left, right) =>
              new Date(left.startDate).getTime() -
              new Date(right.startDate).getTime(),
          );
        const completedTrips = uniqueTrips.filter(
          (trip) => trip.status === "completed",
        );

        setUser(profile);
        setReviews(userReviews);
        setUpcomingTrips(upcomingTripsList);
        setTripsCompletedCount(completedTrips.length);
        setTripsCreatedCount(
          createdTripsResult ? createdTrips.length : profile.tripsCreated,
        );
        setCreatedTripsList(createdTrips);
        setCompletedTripsList(completedTrips);
      } catch (loadError) {
        if (!isMounted) return;

        if (loadError instanceof ApiError && loadError.status === 401) {
          router.replace("/login");
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải trang cá nhân.",
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (params.id) {
      void loadProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
          {error || "Không tìm thấy người dùng."}
        </div>
      </div>
    );
  }

  const trustScore = user.trustScore ?? 0;
  const displayTrustScore = trustScore.toFixed(1);
  const shortName = user.fullName.split(" ").pop() || "thành viên";
  const reliability = user.tripReliability;

  return (
    <div className="container max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-[6px] border-blue-50 shadow-sm rounded-full overflow-hidden">
          <AvatarImage
            src={user.avatarUrl || ""}
            className="object-cover w-full h-full"
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-sky-500 text-white text-4xl font-bold rounded-full">
            {getPublicUserInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left mt-2">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {user.fullName}
            </h1>
            <span
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${user.identityVerified ? "bg-emerald-600 text-white shadow-emerald-100" : "bg-slate-100 text-slate-600 shadow-slate-50"}`}
            >
              {user.identityVerified ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" />
              )}
              {user.identityVerified
                ? "Đã xác minh danh tính"
                : "Chưa xác minh danh tính"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-slate-600 mb-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-sky-600" />{" "}
              {user.city || "Chưa cập nhật thành phố"}
            </span>
            <span className="hidden md:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-indigo-600" /> Thành viên từ{" "}
              {formatJoinedYear(user.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Card
          className="border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => setActiveTab("reviews")}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <RatingStars
              rating={trustScore}
              className="mb-2"
              starClassName="h-6 w-6"
            />
            <span className="text-3xl font-bold text-amber-950 mb-1">
              {displayTrustScore}
            </span>
            <span className="text-xs text-amber-700 uppercase tracking-wider font-semibold">
              Average Rating
            </span>
          </CardContent>
        </Card>

        <Card
          className="border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => setActiveTab("completed")}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Award className="h-6 w-6" />
            </div>
            <span className="text-3xl font-bold text-emerald-950 mb-1">
              {tripsCompletedCount}
            </span>
            <span className="text-xs text-emerald-700 uppercase tracking-wider font-semibold">
              Trips Completed
            </span>
          </CardContent>
        </Card>

        <Card
          className="border-blue-200 bg-gradient-to-br from-blue-50 via-white to-white shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => setActiveTab("created")}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FolderPlus className="h-6 w-6" />
            </div>
            <span className="text-3xl font-bold text-blue-950 mb-1">
              {tripsCreatedCount}
            </span>
            <span className="text-xs text-blue-700 uppercase tracking-wider font-semibold">
              Trips Created
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="flex border-b border-slate-200 mb-8 gap-8 px-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("about")}
          className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === "about" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
        >
          Về {shortName}
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === "reviews" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
        >
          Đánh giá
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === "upcoming" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
        >
          Sắp tới {upcomingTrips.length > 0 && `(${upcomingTrips.length})`}
        </button>
      </div>

      <div className="min-h-[300px]">
        {activeTab === "about" && (
          <div className="animate-in fade-in duration-300 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-5">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Độ tin cậy
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TrustStatusItem
                    icon={Mail}
                    label="Email"
                    verified={Boolean(user.emailVerified)}
                    verifiedLabel="Đã xác minh"
                    unverifiedLabel="Chưa xác minh"
                  />
                  <TrustStatusItem
                    icon={Phone}
                    label="Số điện thoại"
                    verified={Boolean(user.phoneVerified)}
                    verifiedLabel="Đã xác minh"
                    unverifiedLabel="Chưa xác minh"
                  />
                  <TrustStatusItem
                    icon={UserCheck}
                    label="Danh tính"
                    verified={Boolean(user.identityVerified)}
                    verifiedLabel="Đã xác minh"
                    unverifiedLabel="Chưa xác minh"
                  />
                  <TrustStatusItem
                    icon={ShieldCheck}
                    label="Hồ sơ"
                    verified={Boolean(user.profileCompleted)}
                    verifiedLabel="Đã hoàn thiện"
                    unverifiedLabel="Chưa hoàn thiện"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-8">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Lịch sử hành vi chuyến đi
                    </h3>
                    <p className="text-sm text-slate-500">
                      Thống kê dựa trên các sự kiện tham gia chuyến đi đã được hệ thống ghi nhận.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    Tổng lượt ghi nhận: {reliability.totalTrackedTrips}
                  </span>
                </div>

                {reliability.totalTrackedTrips > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <ReliabilityStat
                      label="Tỷ lệ hoàn thành"
                      value={`${reliability.completionRate}%`}
                      detail={`${reliability.completedTrips} chuyến hoàn thành`}
                      tone="emerald"
                    />
                    <ReliabilityStat
                      label="Rời/hủy chuyến"
                      value={`${reliability.cancelLeaveRate}%`}
                      detail={`${reliability.cancelledTrips + reliability.leftTrips} lần trên ${reliability.totalTrackedTrips} lượt ghi nhận`}
                      tone="amber"
                    />
                    <ReliabilityStat
                      label="Bị kick khỏi chuyến"
                      value={`${reliability.kickRate}%`}
                      detail={`${reliability.kickedTrips} lần trên ${reliability.totalTrackedTrips} lượt ghi nhận`}
                      tone="rose"
                    />
                    <ReliabilityStat
                      label="Tổng lượt ghi nhận"
                      value={String(reliability.totalTrackedTrips)}
                      detail="Dựa trên các sự kiện chuyến đi đã ghi nhận"
                      tone="slate"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    <p>Chưa có đủ dữ liệu lịch sử chuyến đi.</p>
                    {reliability.createdTrips > 0 && (
                      <p className="mt-2 font-semibold text-slate-600">
                        Người dùng này đã tạo {reliability.createdTrips} chuyến.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Giới thiệu
                </h3>
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {user.bio ||
                    "Thành viên này chưa cập nhật thông tin giới thiệu."}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Phong cách du lịch
                </h3>
                {user.travelStyle || user.travelPreferences ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-2">
                        Phong cách
                      </h4>
                      <p className="text-sm text-slate-600">
                        {user.travelStyle || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-2">
                        Sở thích / quy tắc khi đi chung
                      </h4>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">
                        {user.travelPreferences || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Người dùng chưa cập nhật phong cách du lịch.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "upcoming" && (
          <TripGrid
            trips={upcomingTrips}
            emptyIcon={<Calendar className="h-12 w-12 text-slate-300 mb-4" />}
            emptyTitle="Chưa có chuyến đi nào"
            emptyDescription="Người dùng này chưa có chuyến đi nào sắp diễn ra."
          />
        )}

        {activeTab === "reviews" && (
          <div className="animate-in fade-in duration-300">
            {reviews.length > 0 ? (
              <UserReviews reviews={reviews} />
            ) : (
              <Card className="border-slate-200 shadow-sm border-dashed">
                <CardContent className="p-16 flex flex-col items-center justify-center text-slate-500 text-center">
                  <h3 className="text-lg font-bold text-slate-700 mb-1">
                    Chưa có đánh giá
                  </h3>
                  <p className="text-sm">
                    Người dùng này chưa có đánh giá nào.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "created" && (
          <TripGrid
            trips={createdTripsList}
            emptyTitle="Chưa có chuyến nào được tạo"
            emptyDescription="Người dùng này chưa tạo chuyến nào."
          />
        )}

        {activeTab === "completed" && (
          <TripGrid
            trips={completedTripsList}
            emptyTitle="Chưa có chuyến đã hoàn thành"
            emptyDescription="Người dùng này chưa hoàn thành chuyến nào."
          />
        )}
      </div>
    </div>
  );
}

function TripGrid({
  trips,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}: {
  trips: Trip[];
  emptyIcon?: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <div className="animate-in fade-in duration-300">
      {trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={tripToCardData(trip)} />
          ))}
        </div>
      ) : (
        <Card className="border-slate-200 shadow-sm border-dashed">
          <CardContent className="p-16 flex flex-col items-center justify-center text-slate-500 text-center">
            {emptyIcon}
            <h3 className="text-lg font-bold text-slate-700 mb-1">
              {emptyTitle}
            </h3>
            <p className="text-sm">{emptyDescription}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TrustStatusItem({
  icon: Icon,
  label,
  verified,
  verifiedLabel,
  unverifiedLabel,
}: {
  icon: ElementType;
  label: string;
  verified: boolean;
  verifiedLabel: string;
  unverifiedLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${verified ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
      >
        {verified ? verifiedLabel : unverifiedLabel}
      </span>
    </div>
  );
}

function ReliabilityStat({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "emerald" | "amber" | "rose" | "slate";
}) {
  const toneClass = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    slate: "border-slate-200 bg-slate-50 text-slate-900",
  }[tone];

  return (
    <div className={`rounded-lg border px-4 py-4 ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-semibold opacity-70">{detail}</p>
    </div>
  );
}

function getPublicUserInitials(fullName: string) {
  const words = fullName.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "TC";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function formatJoinedYear(value: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.getFullYear().toString();
}
