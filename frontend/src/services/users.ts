import { fetchWrapper } from "./fetchWrapper";

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
  };
}
