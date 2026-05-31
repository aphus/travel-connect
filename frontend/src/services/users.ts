import { fetchWrapper } from "./fetchWrapper";

export type PublicUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  trustScore: number;
  tripsCreated: number;
  role: string;
  isBanned: boolean;
  createdAt: string;
  bio?: string | null;
};

type RawPublicUser = {
  id: string;
  email: string;
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
};

export async function getUserProfile(id: string) {
  const user = await fetchWrapper<RawPublicUser>(`/users/${id}`);
  return normalizePublicUser(user);
}

function normalizePublicUser(user: RawPublicUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName ?? user.full_name ?? user.email,
    avatarUrl: user.avatarUrl ?? user.avatar_url ?? null,
    trustScore: Number(user.trustScore ?? user.trust_score ?? 0),
    tripsCreated: Number(user.tripsCreated ?? user.trips_created ?? 0),
    role: user.role,
    isBanned: user.isBanned ?? user.is_banned ?? false,
    createdAt: user.createdAt ?? user.created_at ?? "",
    bio: user.bio ?? null,
  };
}
