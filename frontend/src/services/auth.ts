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
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  city?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  travelStyle?: string | null;
  travelPreferences?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  identityVerified?: boolean;
  profileCompleted?: boolean;
  bannedUntil?: string | null;
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
  email?: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  city?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  travelStyle?: string | null;
  travelPreferences?: string | null;
}) {
  const body: Record<string, string | null> = {};
  if (payload.email !== undefined) body.email = payload.email;
  if (payload.fullName) body.full_name = payload.fullName;
  if (payload.bio !== undefined) body.bio = payload.bio;
  if (payload.avatarUrl !== undefined) {
    body.avatar_url = payload.avatarUrl;
  }
  if (payload.phoneNumber !== undefined) body.phone_number = payload.phoneNumber;
  if (payload.dateOfBirth !== undefined) body.date_of_birth = payload.dateOfBirth;
  if (payload.gender !== undefined) body.gender = payload.gender;
  if (payload.city !== undefined) body.city = payload.city;
  if (payload.emergencyContactName !== undefined) {
    body.emergency_contact_name = payload.emergencyContactName;
  }
  if (payload.emergencyContactPhone !== undefined) {
    body.emergency_contact_phone = payload.emergencyContactPhone;
  }
  if (payload.travelStyle !== undefined) body.travel_style = payload.travelStyle;
  if (payload.travelPreferences !== undefined) {
    body.travel_preferences = payload.travelPreferences;
  }

  const user = await fetchWrapper<RawAuthUser>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  return normalizeAuthUser(user);
}

export function sendPhoneOtp(phoneNumber: string) {
  return fetchWrapper<{ message: string }>("/users/me/phone/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone_number: phoneNumber }),
  });
}

export async function verifyPhoneOtp(phoneNumber: string, code: string) {
  const user = await fetchWrapper<RawAuthUser>("/users/me/phone/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone_number: phoneNumber, code }),
  });

  return normalizeAuthUser(user);
}

export function sendEmailOtp(email: string) {
  return fetchWrapper<{ message: string }>("/users/me/email/send-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmailOtp(email: string, code: string) {
  const user = await fetchWrapper<RawAuthUser>("/users/me/email/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, code }),
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
  phoneNumber?: string | null;
  phone_number?: string | null;
  dateOfBirth?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  city?: string | null;
  emergencyContactName?: string | null;
  emergency_contact_name?: string | null;
  emergencyContactPhone?: string | null;
  emergency_contact_phone?: string | null;
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
  bannedUntil?: string | null;
  banned_until?: string | null;
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
    phoneNumber: user.phoneNumber ?? user.phone_number ?? null,
    dateOfBirth: user.dateOfBirth ?? user.date_of_birth ?? null,
    gender: user.gender ?? null,
    city: user.city ?? null,
    emergencyContactName:
      user.emergencyContactName ?? user.emergency_contact_name ?? null,
    emergencyContactPhone:
      user.emergencyContactPhone ?? user.emergency_contact_phone ?? null,
    travelStyle: user.travelStyle ?? user.travel_style ?? null,
    travelPreferences: user.travelPreferences ?? user.travel_preferences ?? null,
    emailVerified: user.emailVerified ?? user.email_verified,
    phoneVerified: user.phoneVerified ?? user.phone_verified,
    identityVerified: user.identityVerified ?? user.identity_verified,
    profileCompleted: user.profileCompleted ?? user.profile_completed,
    bannedUntil: user.bannedUntil ?? user.banned_until ?? null,
  };
}
