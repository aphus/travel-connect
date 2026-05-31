import { ApiError, fetchWrapper } from "./fetchWrapper";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  trustScore: number;
  tripsCreated: number;
  isBanned?: boolean;
  bio?: string | null;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export function registerUser(payload: {
  fullName: string;
  email: string;
  password: string;
}) {
  return fetchWrapper<AuthResponse>("/auth/register", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: { email: string; password: string }) {
  return fetchWrapper<AuthResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  const user = await fetchWrapper<RawAuthUser>("/users/me");
  return normalizeAuthUser(user);
}

export async function uploadImage(file: File) {
  const formData = new FormData();

  formData.append("folder", "trip_avatars");
  formData.append("file", file);

  return fetchWrapper<{ url: string }>("/upload/image", {
    method: "POST",
    body: formData,
  });
}

export async function updateCurrentUser(payload: {
  fullName?: string;
  bio?: string;
  avatarUrl?: string
}) {
  const body: any = {};
  if (payload.fullName) body.full_name = payload.fullName;
  if (payload.bio !== undefined) body.bio = payload.bio;
  if (payload.avatarUrl !== undefined) {
    body.avatar_url = payload.avatarUrl;
  }

  const user = await fetchWrapper<RawAuthUser>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  return normalizeAuthUser(user);
}

export function storeAuthUser(user: AuthUser, notify = true) {
  if (typeof window === "undefined") return;

  localStorage.setItem("auth_user", JSON.stringify(user));
  if (notify) {
    window.dispatchEvent(new Event("auth-user-changed"));
  }
}

export function getStoredAuthUser() {
  if (typeof window === "undefined") return null;

  const rawUser = localStorage.getItem("auth_user");
  if (!rawUser) return null;

  try {
    return normalizeAuthUser(JSON.parse(rawUser) as RawAuthUser);
  } catch {
    localStorage.removeItem("auth_user");
    return null;
  }
}

export function setAuthFlash(
  message: string,
  type: "success" | "error" = "success",
) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem("auth_flash", JSON.stringify({ message, type }));
  window.dispatchEvent(new Event("auth-flash"));
}

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 409) return "Email đã được sử dụng";
    if (error.status === 401) return "Sai mật khẩu";
    if (error.status === 403) return "Tài khoản đã bị khóa";

    return error.message || "Không thể xử lý yêu cầu";
  }

  return "Không thể kết nối tới máy chủ. Vui lòng thử lại.";
}

type RawAuthUser = {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  full_name?: string;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  trustScore?: number | string;
  trust_score?: number | string;
  tripsCreated?: number;
  trips_created?: number;
  isBanned?: boolean;
  is_banned?: boolean;
  bio?: string | null;
};

function normalizeAuthUser(user: RawAuthUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName ?? user.full_name ?? user.email,
    avatarUrl: user.avatarUrl ?? user.avatar_url ?? null,
    role: user.role,
    trustScore: Number(user.trustScore ?? user.trust_score ?? 0),
    tripsCreated: Number(user.tripsCreated ?? user.trips_created ?? 0),
    isBanned: user.isBanned ?? user.is_banned,
    bio: user.bio ?? null,
  };
}
