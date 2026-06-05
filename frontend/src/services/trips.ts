import type { Trip as TripCardData } from "@/components/trip/TripCard";
import {
  formatCurrencyVnd,
  formatDisplayDate,
  parseCurrencyInput,
  parsePositiveIntegerInput,
} from "@/lib/trip-format";
import { formatTripDestination } from "@/lib/vietnam-destinations";
import { fetchWrapper } from "./fetchWrapper";

export type TripStatus =
  | "upcoming"
  | "ongoing"
  | "awaiting_confirmation"
  | "completed"
  | "cancelled";

type RawTripStatus = TripStatus | "in_progress";

export type TripLeader = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  trustScore: number;
  identityVerified: boolean;
  profileCompleted: boolean;
};

export type TripMemberUser = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  trustScore: number;
  identityVerified: boolean;
  profileCompleted: boolean;
};

export type Trip = {
  id: string;
  destination: string;
  destinationPlace: string | null;
  startDate: string;
  endDate: string;
  budget: number | null;
  currentMembers: number;
  maxMembers: number;
  description: string | null;
  status: TripStatus;
  pendingRequests: number;
  joinStatus?: JoinStatus;
  leaderId: string;
  leaderMarkedCompleted: boolean;
  createdAt: string;
  leader: TripLeader | null;
  coverUrl?: string | null;
  members: TripMember[];
};

export type JoinStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELED"
  | "REMOVED"
  | "LEFT";

export type TripRelation = {
  isLeader: boolean;
  isMember: boolean;
  joinStatus: JoinStatus | null;
};

export type TripJoinRequest = {
  id: string;
  message: string | null;
  status: JoinStatus;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    trustScore: number;
  };
};

export type TripMember = {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  trustScore: number;
  role: "LEADER" | "MEMBER";
  joinedAt: string;
  user: TripMemberUser;
};

type RawTrip = {
  id: string;
  destination: string;
  destinationPlace?: string | null;
  destination_place?: string | null;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  budget?: number | string | null;
  currentMembers?: number;
  current_members?: number;
  maxMembers?: number;
  max_members?: number;
  description?: string | null;
  status?: RawTripStatus;
  pendingRequests?: number;
  pending_requests?: number;
  joinStatus?: JoinStatus;
  join_status?: JoinStatus;
  leaderId?: string;
  leader_id?: string;
  leaderMarkedCompleted?: boolean;
  leader_marked_completed?: boolean;
  createdAt?: string;
  created_at?: string;
  leader?: RawLeader | null;
  coverUrl?: string | null;
  cover_url?: string | null;
  members?: RawTripMember[] | null;
  trip_members?: RawTripMember[] | null;
};

type RawLeader = {
  id: string;
  fullName?: string;
  full_name?: string;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  trustScore?: number | string;
  trust_score?: number | string;
  identityVerified?: boolean;
  identity_verified?: boolean;
  profileCompleted?: boolean;
  profile_completed?: boolean;
};

type RawTripRelation = {
  isLeader?: boolean;
  is_leader?: boolean;
  isMember?: boolean;
  is_member?: boolean;
  joinStatus?: JoinStatus | null;
  join_status?: JoinStatus | null;
};

type RawTripJoinRequest = {
  id: string;
  message?: string | null;
  status: JoinStatus;
  createdAt?: string;
  created_at?: string;
  user: {
    id: string;
    fullName?: string;
    full_name?: string;
    avatarUrl?: string | null;
    avatar_url?: string | null;
    trustScore?: number | string;
    trust_score?: number | string;
  };
};

type RawTripMember = {
  id: string;
  user?: RawTripMemberUser | null;
  userId?: string;
  user_id?: string;
  name?: string;
  fullName?: string;
  full_name?: string;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  trustScore?: number | string;
  trust_score?: number | string;
  role: "LEADER" | "MEMBER";
  joinedAt?: string;
  joined_at?: string;
};

type RawTripMemberUser = {
  id: string;
  fullName?: string;
  full_name?: string;
  name?: string;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  avatar?: string | null;
  trustScore?: number | string;
  trust_score?: number | string;
  identityVerified?: boolean;
  identity_verified?: boolean;
  profileCompleted?: boolean;
  profile_completed?: boolean;
};

export type CreateTripPayload = {
  destination: string;
  destinationPlace: string;
  startDate: string;
  endDate: string;
  budget: number;
  maxMembers: number;
  description: string;
  coverUrl?: string | null;
};

export type UpdateTripPayload = Partial<CreateTripPayload>;

export type ListTripsFilters = {
  destination?: string;
  destinationPlace?: string;
  startDate?: string;
  endDate?: string;
  budget?: number | string | null;
  maxMembers?: number | string | null;
};

export async function createTrip(payload: CreateTripPayload) {
  const trip = await fetchWrapper<RawTrip>("/trips", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return normalizeTrip(trip);
}

export async function updateTrip(id: string, payload: UpdateTripPayload) {
  const trip = await fetchWrapper<RawTrip>(`/trips/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return normalizeTrip(trip);
}

export async function listTrips(filters: ListTripsFilters = {}) {
  const params = new URLSearchParams();

  if (filters.destination?.trim()) {
    params.set("destination", filters.destination.trim());
  }

  if (filters.destinationPlace?.trim()) {
    params.set("destinationPlace", filters.destinationPlace.trim());
  }

  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);

  const budget =
    typeof filters.budget === "string"
      ? parseCurrencyInput(filters.budget)
      : filters.budget;
  if (typeof budget === "number" && budget > 0) {
    params.set("budget", String(budget));
  }

  const maxMembers =
    typeof filters.maxMembers === "string"
      ? parsePositiveIntegerInput(filters.maxMembers)
      : filters.maxMembers;
  if (typeof maxMembers === "number" && maxMembers > 0) {
    params.set("maxMembers", String(maxMembers));
  }

  const query = params.toString();
  const trips = await fetchWrapper<RawTrip[]>(
    query ? `/trips?${query}` : "/trips",
    { auth: false },
  );

  return trips.map(normalizeTrip);
}

export async function getTrip(id: string) {
  const trip = await fetchWrapper<RawTrip>(`/trips/${id}`, { auth: false });
  return normalizeTrip(trip);
}

export async function getTripRelation(id: string) {
  const relation = await fetchWrapper<RawTripRelation>(`/trips/${id}/relation`);

  return {
    isLeader: relation.isLeader ?? relation.is_leader ?? false,
    isMember: relation.isMember ?? relation.is_member ?? false,
    joinStatus: relation.joinStatus ?? relation.join_status ?? null,
  };
}

export async function getMyCreatedTrips() {
  const trips = await fetchWrapper<RawTrip[]>("/trips/me/created");
  return trips.map(normalizeTrip);
}

export async function getMyJoinedTrips() {
  const trips = await fetchWrapper<RawTrip[]>("/trips/me/joined");
  return trips.map(normalizeTrip);
}

export async function getUserCreatedTrips(userId: string) {
  const trips = await fetchWrapper<RawTrip[]>(
    `/trips/users/${userId}/created`,
    { auth: false },
  );
  return trips.map(normalizeTrip);
}

export async function getUserJoinedTrips(userId: string) {
  const trips = await fetchWrapper<RawTrip[]>(
    `/trips/users/${userId}/joined`,
    { auth: false },
  );
  return trips.map(normalizeTrip);
}

export async function cancelTrip(id: string) {
  const trip = await fetchWrapper<RawTrip>(`/trips/${id}/cancel`, {
    method: "DELETE",
  });

  return normalizeTrip(trip);
}

export async function requestJoinTrip(id: string, message?: string) {
  return fetchWrapper<{ id: string; status: JoinStatus }>(`/trips/${id}/join`, {
    method: "POST",
    body: JSON.stringify({ message: message?.trim() || undefined }),
  });
}

export async function getTripJoinRequests(id: string) {
  const requests = await fetchWrapper<RawTripJoinRequest[]>(
    `/trips/${id}/requests`,
  );
  return requests.map(normalizeTripJoinRequest);
}

export async function approveTripJoinRequest(tripId: string, requestId: string) {
  return fetchWrapper<{ id: string; status: JoinStatus }>(
    `/trips/${tripId}/requests/${requestId}/approve`,
    { method: "PATCH" },
  );
}

export async function rejectTripJoinRequest(tripId: string, requestId: string) {
  return fetchWrapper<{ id: string; status: JoinStatus }>(
    `/trips/${tripId}/requests/${requestId}/reject`,
    { method: "PATCH" },
  );
}

export async function cancelOwnJoinRequest(tripId: string) {
  return fetchWrapper<{ id: string; status: JoinStatus }>(
    `/trips/${tripId}/join-request`,
    { method: "DELETE" },
  );
}

export async function getTripMembers(tripId: string) {
  const members = await fetchWrapper<RawTripMember[]>(`/trips/${tripId}/members`);
  return members.map(normalizeTripMember);
}

export async function removeTripMember(tripId: string, memberUserId: string) {
  return fetchWrapper<{ success: boolean }>(
    `/trips/${tripId}/members/${memberUserId}`,
    { method: "DELETE" },
  );
}

export async function leaveTrip(tripId: string) {
  return fetchWrapper<{ success: boolean }>(`/trips/${tripId}/leave`, {
    method: "DELETE",
  });
}

export async function completeTrip(tripId: string) {
  const trip = await fetchWrapper<RawTrip>(`/trips/${tripId}/complete`, {
    method: "PATCH",
  });

  return normalizeTrip(trip);
}

export async function markTripCompleted(tripId: string) {
  const trip = await fetchWrapper<RawTrip>(`/trips/${tripId}/mark-completed`, {
    method: "PATCH",
  });

  return normalizeTrip(trip);
}

export async function confirmTripCompletion(tripId: string) {
  return fetchWrapper<{ trip_status: string }>(
    `/trips/${tripId}/completion-confirmations`,
    { method: "POST" },
  );
}

export function tripToCardData(trip: Trip): TripCardData {
  const destinationLabel = getTripDestinationLabel(trip);
  const { title } = splitTripDescription(trip.description, destinationLabel);

  return {
    id: trip.id,
    title,
    location: destinationLabel,
    startDate: formatDisplayDate(trip.startDate),
    endDate: formatDisplayDate(trip.endDate),
    budget: formatCurrencyVnd(trip.budget),
    currentMembers: trip.currentMembers,
    maxMembers: trip.maxMembers,
    coverUrl: trip.coverUrl || "",
    leader: {
      name: trip.leader?.fullName ?? "Leader",
      avatarUrl: trip.leader?.avatarUrl ?? undefined,
      trustScore: trip.leader?.trustScore ?? 0,
    },
    joinStatus: trip.joinStatus,
    status: trip.status,
    leaderMarkedCompleted: trip.leaderMarkedCompleted,
  };
}

export function tripToDetailData(trip: Trip) {
  const destinationLabel = getTripDestinationLabel(trip);
  const { title, body } = splitTripDescription(trip.description, destinationLabel);

  return {
    id: trip.id,
    title,
    description: body || trip.description || "Chưa có mô tả chi tiết.",
    destination: destinationLabel,
    startDate: formatDisplayDate(trip.startDate),
    endDate: formatDisplayDate(trip.endDate),
    budget: formatCurrencyVnd(trip.budget),
    maxMembers: trip.maxMembers,
    currentMembers: trip.currentMembers,
    pendingRequests: trip.pendingRequests,
    status: toUiStatus(trip.status),
    leaderId: trip.leaderId,
    leader: {
      id: trip.leader?.id ?? trip.leaderId,
      name: trip.leader?.fullName ?? "Leader",
      avatar: trip.leader?.avatarUrl ?? "",
      trustScore: trip.leader?.trustScore ?? 0,
    },
    members: trip.members,
  };
}

export function getTripTitle(trip: Trip) {
  return splitTripDescription(
    trip.description,
    getTripDestinationLabel(trip),
  ).title;
}

export function getTripDestinationLabel(
  trip: Pick<Trip, "destination" | "destinationPlace">,
) {
  return formatTripDestination(trip.destination, trip.destinationPlace);
}

function normalizeTrip(trip: RawTrip): Trip {
  return {
    id: trip.id,
    destination: trip.destination,
    destinationPlace: trip.destinationPlace ?? trip.destination_place ?? null,
    startDate: trip.startDate ?? trip.start_date ?? "",
    endDate: trip.endDate ?? trip.end_date ?? "",
    budget:
      trip.budget === null || trip.budget === undefined
        ? null
        : Number(trip.budget),
    currentMembers: Number(trip.currentMembers ?? trip.current_members ?? 1),
    maxMembers: Number(trip.maxMembers ?? trip.max_members ?? 0),
    description: trip.description ?? null,
    status: normalizeTripStatus(trip.status),
    pendingRequests: Number(trip.pendingRequests ?? trip.pending_requests ?? 0),
    joinStatus: trip.joinStatus ?? trip.join_status,
    leaderId: trip.leaderId ?? trip.leader_id ?? "",
    leaderMarkedCompleted:
      trip.leaderMarkedCompleted ?? trip.leader_marked_completed ?? false,
    createdAt: trip.createdAt ?? trip.created_at ?? "",
    leader: trip.leader ? normalizeLeader(trip.leader) : null,
    coverUrl: trip.coverUrl ?? trip.cover_url ?? null,
    members: (trip.members ?? trip.trip_members ?? [])
      .map(normalizeTripMember)
      .filter((member) => Boolean(member.userId)),
  };
}

function normalizeLeader(leader: RawLeader): TripLeader {
  return {
    id: leader.id,
    fullName: leader.fullName ?? leader.full_name ?? "Leader",
    avatarUrl: leader.avatarUrl ?? leader.avatar_url ?? null,
    trustScore: Number(leader.trustScore ?? leader.trust_score ?? 0),
    identityVerified: leader.identityVerified ?? leader.identity_verified ?? false,
    profileCompleted: leader.profileCompleted ?? leader.profile_completed ?? false,
  };
}

function normalizeTripJoinRequest(request: RawTripJoinRequest): TripJoinRequest {
  return {
    id: request.id,
    message: request.message ?? null,
    status: request.status,
    createdAt: request.createdAt ?? request.created_at ?? "",
    user: {
      id: request.user.id,
      fullName: request.user.fullName ?? request.user.full_name ?? "Người dùng",
      avatarUrl: request.user.avatarUrl ?? request.user.avatar_url ?? null,
      trustScore: Number(request.user.trustScore ?? request.user.trust_score ?? 0),
    },
  };
}

function normalizeTripMember(member: RawTripMember): TripMember {
  const rawUser = member.user;
  const userId = rawUser?.id ?? member.userId ?? member.user_id ?? "";
  const fullName =
    rawUser?.fullName ??
    rawUser?.full_name ??
    rawUser?.name ??
    member.name ??
    member.fullName ??
    member.full_name ??
    "Thành viên TripConnect";
  const avatarUrl =
    rawUser?.avatarUrl ??
    rawUser?.avatar_url ??
    rawUser?.avatar ??
    member.avatarUrl ??
    member.avatar_url ??
    null;
  const trustScore = Number(
    rawUser?.trustScore ??
    rawUser?.trust_score ??
    member.trustScore ??
    member.trust_score ??
    0,
  );

  return {
    id: member.id,
    userId,
    name: fullName,
    avatarUrl,
    trustScore,
    role: member.role,
    joinedAt: member.joinedAt ?? member.joined_at ?? "",
    user: {
      id: userId,
      fullName,
      avatarUrl,
      trustScore,
      identityVerified:
        rawUser?.identityVerified ?? rawUser?.identity_verified ?? false,
      profileCompleted:
        rawUser?.profileCompleted ?? rawUser?.profile_completed ?? false,
    },
  };
}

function splitTripDescription(description: string | null, destination: string) {
  const parts = (description ?? "")
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    title: parts[0] || `Chuyến đi ${destination}`,
    body: parts.slice(1).join("\n\n"),
  };
}

function normalizeTripStatus(status?: RawTripStatus): TripStatus {
  if (status === "in_progress") return "ongoing";
  return status ?? "upcoming";
}

function toUiStatus(status: RawTripStatus) {
  if (status === "in_progress") return "ONGOING";
  return status.toUpperCase();
}
