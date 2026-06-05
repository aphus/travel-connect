import { fetchWrapper } from "./fetchWrapper";
import { formatTripDestination } from "@/lib/vietnam-destinations";

export type AdminUser = {
    id: string;
    email: string;
    fullName?: string;
    full_name?: string;
    role: string;
    isBanned?: boolean;
    is_banned?: boolean;
    createdAt?: string;
    created_at?: string;
};

// 1. Lấy danh sách toàn bộ người dùng
export async function getAllUsers() {
    return fetchWrapper<AdminUser[]>("/admin/users", {
        method: "GET",
    });
}

// 2. Khóa / Mở khóa tài khoản người dùng
export async function toggleUserBan(userId: string, isBanned: boolean) {
    return fetchWrapper<{ message: string; user: AdminUser }>(`/admin/users/${userId}/ban`, {
        method: "PATCH",
        body: JSON.stringify({ isBanned }),
    });
}

export type AdminTrip = {
    id: string;
    destination: string;
    destinationPlace?: string | null;
    destination_place?: string | null;
    leaderId: string;
    startDate: string;
    endDate: string;
    status: string;
    reportCount?: number;
    description?: string;
    cost?: number;
    createdAt?: string;

    members?: {
        id: string;
        role: string;
        status: string;
        user?: {
            id: string;
            full_name?: string;
            email?: string;
        }
    }[];
};

// 3. Lấy danh sách toàn bộ chuyến đi
export async function getAllTrips() {
    return fetchWrapper<AdminTrip[]>("/admin/trips", {
        method: "GET",
    });
}

// 4. Hủy chuyến đi vi phạm
export async function cancelTripAsAdmin(tripId: string) {
    return fetchWrapper<{ message: string }>(`/admin/trips/${tripId}/cancel`, {
        method: "PATCH",
    });
}


export async function getAllReports() {
    return fetchWrapper<AdminReport[]>("/admin/reports", {
        method: "GET",
    });
}


export type AdminReport = {
    id: string;
    targetType?: string;
    target_type?: string;
    targetId?: string;
    target_id?: string;
    reported_id?: string;
    reason: string;
    description?: string;
    status?: string;
    createdAt?: string;
    created_at?: string;
    reporter?: { id: string; email: string; full_name?: string };
    reported?: { id: string; email: string; full_name?: string };
    trip?: { id: string; destination?: string; destinationPlace?: string | null; destination_place?: string | null };
};

export function getAdminTripDestinationLabel(
    trip: Pick<AdminTrip, "destination" | "destinationPlace" | "destination_place">,
) {
    return formatTripDestination(
        trip.destination,
        trip.destinationPlace ?? trip.destination_place ?? null,
    );
}
