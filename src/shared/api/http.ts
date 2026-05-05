export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "https://api-stage-opto.vestor.uz"
).replace(/\/$/, "");

export const getStoredAccessToken = () => {
  const directToken =
    localStorage.getItem("accessToken") ??
    localStorage.getItem("token") ??
    localStorage.getItem("authToken");

  if (directToken) return directToken;

  const persistedAuth = localStorage.getItem("auth-storage");
  if (!persistedAuth) return null;

  try {
    const parsed = JSON.parse(persistedAuth);
    return parsed?.state?.accessToken ?? parsed?.state?.token ?? parsed?.state?.user?.token ?? null;
  } catch {
    return null;
  }
};

const getStoredRefreshToken = (): string | null => {
  try {
    const stored = localStorage.getItem("auth-storage");
    return stored ? (JSON.parse(stored)?.state?.refreshToken ?? null) : null;
  } catch {
    return null;
  }
};

// --- Token refresh callbacks (wired up by authStore to avoid circular imports) ---

export type RefreshedSession = {
  accessToken: string;
  refreshToken: string;
  user: { id: number; firstName: string; lastName: string; email?: string | null; phone: string; role: string };
};

type OnRefreshedCallback = (session: RefreshedSession) => void;
type OnExpiredCallback = () => void;

let _onRefreshed: OnRefreshedCallback | null = null;
let _onExpired: OnExpiredCallback | null = null;
let _onServerError: ((path: string) => void) | null = null;

export const configureTokenRefresh = (onRefreshed: OnRefreshedCallback, onExpired: OnExpiredCallback) => {
  _onRefreshed = onRefreshed;
  _onExpired = onExpired;
};

export const configureServerErrorHandler = (handler: (path: string) => void) => {
  _onServerError = handler;
};

// Single-flight refresh — all concurrent 401s share the same in-flight request
let _refreshing: Promise<string> | null = null;

const attemptRefresh = (): Promise<string> => {
  if (_refreshing) return _refreshing;

  _refreshing = (async () => {
    const rt = getStoredRefreshToken();
    if (!rt) throw new Error("No refresh token");

    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify({ refreshToken: rt }),
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = (await res.json()) as RefreshedSession;
    _onRefreshed?.(data);
    return data.accessToken;
  })().finally(() => {
    _refreshing = null;
  });

  return _refreshing;
};

// --- Core request helper ---

export const apiRequest = async <T>(path: string, options: RequestInit = {}) => {
  const token = getStoredAccessToken();
  const headers = new Headers(options.headers);

  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("ngrok-skip-browser-warning", "true");

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  // 401 → attempt token refresh then retry once
  if (response.status === 401) {
    let newToken: string;
    try {
      newToken = await attemptRefresh();
    } catch {
      _onExpired?.();
      throw new Error("Session expired. Please log in again.");
    }

    const retryHeaders = new Headers(options.headers);
    retryHeaders.set("Authorization", `Bearer ${newToken}`);
    retryHeaders.set("ngrok-skip-browser-warning", "true");

    const retryResponse = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: retryHeaders });

    if (!retryResponse.ok) {
      let message = `Request failed with status ${retryResponse.status}`;
      try {
        const body = await retryResponse.json();
        message = body?.detail ?? body?.title ?? body?.message ?? message;
      } catch {
        const text = await retryResponse.text();
        if (text) message = text;
      }
      throw new Error(message);
    }

    if (retryResponse.status === 204) return undefined as T;
    const retryText = await retryResponse.text();
    return retryText ? (JSON.parse(retryText) as T) : (undefined as T);
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = await response.json();
      message = body?.detail ?? body?.title ?? body?.message ?? message;
    } catch {
      const text = await response.text();
      if (text) message = text;
    }

    if (response.status >= 500) {
      _onServerError?.(path);
    }

    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
};
