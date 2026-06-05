import { fetchWrapper } from "./fetchWrapper";

export type TripReliability = {
  completedTrips: number;
  createdTrips: number;
  cancelledTrips: number;
  leftTrips: number;
  kickedTrips: number;
  totalTrackedTrips: number;
  completionRate: number;
  cancelLeaveRate: number;
  kickRate: number;
};

export type PublicUser = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  trustScore: number;
  tripsCreated: number;
  role: string;
  isBanned: boolean;
  createdAt: string;
  bio?: string | null;
  city?: string | null;
  gender?: string | null;
  travelStyle?: string | null;
  travelPreferences?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  identityVerified?: boolean;
  profileCompleted?: boolean;
  tripReliability: TripReliability;
};

type RawTripReliability = {
  completedTrips?: number | string;
  completed_trips?: number | string;
  createdTrips?: number | string;
  created_trips?: number | string;
  cancelledTrips?: number | string;
  cancelled_trips?: number | string;
  leftTrips?: number | string;
  left_trips?: number | string;
  kickedTrips?: number | string;
  kicked_trips?: number | string;
  totalTrackedTrips?: number | string;
  total_tracked_trips?: number | string;
  completionRate?: number | string;
  completion_rate?: number | string;
  cancelLeaveRate?: number | string;
  cancel_leave_rate?: number | string;
  kickRate?: number | string;
  kick_rate?: number | string;
};

type RawPublicUser = {
  id: string;
  fullName?: string;
  full_name?: string;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  trustScore?: number | string;
  trust_score?: number | string;
  tripsCreated?: number;
  trips_created?: number;
  role: string;
  isBanned?: boolean;
  is_banned?: boolean;
  createdAt?: string;
  created_at?: string;
  bio?: string | null;
  city?: string | null;
  gender?: string | null;
  travelStyle?: string | null;
  travel_style?: string | null;
  travelPreferences?: string | null;
  travel_preferences?: string | null;
  emailVerified?: boolean;
  email_verified?: boolean;
  phoneVerified?: boolean;
  phone_verified?: boolean;
  identityVerified?: boolean;
  identity_verified?: boolean;
  profileCompleted?: boolean;
  profile_completed?: boolean;
  tripReliability?: RawTripReliability;
  trip_reliability?: RawTripReliability;
};

export async function getUserProfile(id: string) {
  const user = await fetchWrapper<RawPublicUser>(`/users/${id}`);
  return normalizePublicUser(user);
}

function normalizePublicUser(user: RawPublicUser): PublicUser {
  return {
    id: user.id,
    fullName: user.fullName ?? user.full_name ?? "Thành viên TripConnect",
    avatarUrl: user.avatarUrl ?? user.avatar_url ?? null,
    trustScore: Number(user.trustScore ?? user.trust_score ?? 0),
    tripsCreated: Number(user.tripsCreated ?? user.trips_created ?? 0),
    role: user.role,
    isBanned: user.isBanned ?? user.is_banned ?? false,
    createdAt: user.createdAt ?? user.created_at ?? "",
    bio: user.bio ?? null,
    city: user.city ?? null,
    gender: user.gender ?? null,
    travelStyle: user.travelStyle ?? user.travel_style ?? null,
    travelPreferences: user.travelPreferences ?? user.travel_preferences ?? null,
    emailVerified: user.emailVerified ?? user.email_verified,
    phoneVerified: user.phoneVerified ?? user.phone_verified,
    identityVerified: user.identityVerified ?? user.identity_verified,
    profileCompleted: user.profileCompleted ?? user.profile_completed,
    tripReliability: normalizeTripReliability(
      user.tripReliability ?? user.trip_reliability,
    ),
  };
}

function normalizeTripReliability(
  reliability?: RawTripReliability,
): TripReliability {
  return {
    completedTrips: Number(
      reliability?.completedTrips ?? reliability?.completed_trips ?? 0,
    ),
    createdTrips: Number(
      reliability?.createdTrips ?? reliability?.created_trips ?? 0,
    ),
    cancelledTrips: Number(
      reliability?.cancelledTrips ?? reliability?.cancelled_trips ?? 0,
    ),
    leftTrips: Number(reliability?.leftTrips ?? reliability?.left_trips ?? 0),
    kickedTrips: Number(
      reliability?.kickedTrips ?? reliability?.kicked_trips ?? 0,
    ),
    totalTrackedTrips: Number(
      reliability?.totalTrackedTrips ?? reliability?.total_tracked_trips ?? 0,
    ),
    completionRate: Number(
      reliability?.completionRate ?? reliability?.completion_rate ?? 0,
    ),
    cancelLeaveRate: Number(
      reliability?.cancelLeaveRate ?? reliability?.cancel_leave_rate ?? 0,
    ),
    kickRate: Number(reliability?.kickRate ?? reliability?.kick_rate ?? 0),
  };
}
