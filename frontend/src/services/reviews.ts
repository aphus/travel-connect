import { fetchWrapper } from "./fetchWrapper";
import { formatTripDestination } from "@/lib/vietnam-destinations";

export type UserReview = {
  id: string;
  tripId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  trip: {
    id: string;
    destination: string;
    destinationPlace?: string | null;
    startDate: string;
    endDate: string;
  } | null;
};

export type TripReview = {
  id: string;
  tripId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  reviewee: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
};

export type CreateReviewPayload = {
  tripId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
};

type RawUserReview = {
  id: string;
  trip_id?: string;
  tripId?: string;
  rating: number | string;
  comment?: string | null;
  created_at?: string;
  createdAt?: string;
  reviewer?: {
    id: string;
    full_name?: string;
    fullName?: string;
    avatar_url?: string | null;
    avatarUrl?: string | null;
  } | null;
  trip?: {
    id: string;
    destination: string;
    destinationPlace?: string | null;
    destination_place?: string | null;
    startDate?: string;
    start_date?: string;
    endDate?: string;
    end_date?: string;
  } | null;
};

type RawTripReview = RawUserReview & {
  reviewee?: {
    id: string;
    full_name?: string;
    fullName?: string;
    avatar_url?: string | null;
    avatarUrl?: string | null;
  } | null;
};

export async function createReview(payload: CreateReviewPayload) {
  return fetchWrapper("/reviews", {
    method: "POST",
    body: JSON.stringify({
      trip_id: payload.tripId,
      reviewee_id: payload.revieweeId,
      rating: payload.rating,
      comment: payload.comment?.trim() || undefined,
    }),
  });
}

export async function getUserReviews(userId: string) {
  const reviews = await fetchWrapper<RawUserReview[]>(`/reviews/users/${userId}`);

  return reviews.map(normalizeUserReview);
}

export async function getTripReviews(tripId: string) {
  const reviews = await fetchWrapper<RawTripReview[]>(`/reviews/trips/${tripId}`);

  return reviews.map(normalizeTripReview);
}

function normalizeUserReview(review: RawUserReview): UserReview {
  return {
    id: review.id,
    tripId: review.tripId ?? review.trip_id ?? "",
    rating: Number(review.rating),
    comment: review.comment ?? null,
    createdAt: review.createdAt ?? review.created_at ?? "",
    reviewer: {
      id: review.reviewer?.id ?? "",
      fullName:
        review.reviewer?.fullName ??
        review.reviewer?.full_name ??
        "Thành viên TripConnect",
      avatarUrl: review.reviewer?.avatarUrl ?? review.reviewer?.avatar_url ?? null,
    },
    trip: review.trip
      ? {
          id: review.trip.id,
          destination: formatTripDestination(
            review.trip.destination,
            review.trip.destinationPlace ?? review.trip.destination_place ?? null,
          ),
          destinationPlace:
            review.trip.destinationPlace ?? review.trip.destination_place ?? null,
          startDate: review.trip.startDate ?? review.trip.start_date ?? "",
          endDate: review.trip.endDate ?? review.trip.end_date ?? "",
        }
      : null,
  };
}

function normalizeTripReview(review: RawTripReview): TripReview {
  return {
    id: review.id,
    tripId: review.tripId ?? review.trip_id ?? "",
    rating: Number(review.rating),
    comment: review.comment ?? null,
    createdAt: review.createdAt ?? review.created_at ?? "",
    reviewer: {
      id: review.reviewer?.id ?? "",
      fullName:
        review.reviewer?.fullName ??
        review.reviewer?.full_name ??
        "Thành viên TripConnect",
      avatarUrl: review.reviewer?.avatarUrl ?? review.reviewer?.avatar_url ?? null,
    },
    reviewee: {
      id: review.reviewee?.id ?? "",
      fullName:
        review.reviewee?.fullName ??
        review.reviewee?.full_name ??
        "Thành viên TripConnect",
      avatarUrl: review.reviewee?.avatarUrl ?? review.reviewee?.avatar_url ?? null,
    },
  };
}
