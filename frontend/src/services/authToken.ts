export const AUTH_TOKEN_KEY = "accessToken";
const LEGACY_AUTH_TOKEN_KEY = "token";

export const AUTH_TOKEN_CHANGED_EVENT = "auth-token-changed";

function notifyAuthTokenChanged() {
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(AUTH_TOKEN_KEY)?.trim();
  if (token) return token;

  const legacyToken = localStorage.getItem(LEGACY_AUTH_TOKEN_KEY)?.trim();
  if (!legacyToken) return null;

  localStorage.setItem(AUTH_TOKEN_KEY, legacyToken);
  return legacyToken;
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  notifyAuthTokenChanged();
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  notifyAuthTokenChanged();
}
