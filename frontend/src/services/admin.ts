import { fetchWrapper } from "./fetchWrapper";

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
    trip?: { id: string; destination?: string };
    previousReportCount?: number;
    accountStatus?: string;
};

export type IdentityVerificationStatus = "pending" | "approved" | "rejected";

export type AdminIdentityVerificationRequest = {
    id: string;
    user: {
        id: string;
        full_name?: string;
        fullName?: string;
        email: string;
    };
    document_url: string | null;
    status: IdentityVerificationStatus;
    submitted_at: string;
    reject_reason?: string | null;
};

export function getIdentityVerificationRequests(status?: IdentityVerificationStatus) {
    const query = status ? `?status=${status}` : "";

    return fetchWrapper<AdminIdentityVerificationRequest[]>(
        `/admin/identity-verifications${query}`,
        {
            method: "GET",
        },
    );
}

export function approveIdentityVerification(id: string) {
    return fetchWrapper<{ message: string }>(
        `/admin/identity-verifications/${id}/approve`,
        {
            method: "PATCH",
        },
    );
}

export function rejectIdentityVerification(id: string, reason: string) {
    return fetchWrapper<{ message: string }>(
        `/admin/identity-verifications/${id}/reject`,
        {
            method: "PATCH",
            body: JSON.stringify({ reason }),
        },
    );
}
