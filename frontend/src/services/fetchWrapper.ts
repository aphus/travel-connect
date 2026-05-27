const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type FetchWrapperOptions = RequestInit & {
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("access_token");
  if (token) return token;

  const legacyToken = localStorage.getItem("accessToken");
  if (legacyToken) {
    localStorage.setItem("access_token", legacyToken);
    localStorage.removeItem("accessToken");
    return legacyToken;
  }

  return null;
}

export function setAccessToken(token: string) {
  localStorage.setItem("access_token", token);
  localStorage.removeItem("accessToken");
  window.dispatchEvent(new Event("auth-token-changed"));
}

export function clearAccessToken() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("auth_user");
  window.dispatchEvent(new Event("auth-token-changed"));
}

export async function fetchWrapper<T>(
  path: string,
  options: FetchWrapperOptions = {},
) {
  const { auth = true, headers, body, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  if (body && !isFormData && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (auth && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...requestOptions,
    body,
    headers: requestHeaders,
  });
  const data = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      extractApiMessage(data, response.statusText),
      response.status,
      data,
    );
  }

  return data as T;
}

export async function validateStoredToken() {
  if (!getAccessToken()) return false;

  try {
    await fetchWrapper("/users/me");
    return true;
  } catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.status)) {
      clearAccessToken();
    }

    return false;
  }
}

function buildUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function extractApiMessage(data: unknown, fallback: string) {
  if (typeof data === "string") return data || fallback;
  if (!isRecord(data)) return fallback;

  const message = data.message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.join(", ");

  if (isRecord(message)) {
    const nestedMessage = message.message;
    if (typeof nestedMessage === "string") return nestedMessage;
    if (Array.isArray(nestedMessage)) return nestedMessage.join(", ");
  }

  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
