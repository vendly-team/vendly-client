import { i18n } from "@/lib/i18n";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "https://api-stage-opto.vestor.uz"
).replace(/\/$/, "");

const langToAcceptLanguage: Record<string, string> = {
  uz: "UZ",
  ru: "RU",
  en: "EN",
  "uz-Cyrl": "UZ-CYRL",
};

const getAcceptLanguage = () => langToAcceptLanguage[i18n.language] ?? "UZ";

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
  expiresIn: number;
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

// API xatosi: ProblemDetails ichidagi domen kodini (masalan "Shipping.RouteUnavailable") ham olib yuradi.
export class ApiError extends Error {
  code: string | null;
  status: number;

  constructor(message: string, code: string | null, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

// Javob tanasini bir marta o'qiydi (json/text ikki marta o'qish → "body stream already read" bug'ini oldini oladi)
const readError = async (response: Response): Promise<ApiError> => {
  const fallback = `Request failed with status ${response.status}`;
  let raw = "";
  try {
    raw = await response.text();
  } catch {
    return new ApiError(fallback, null, response.status);
  }
  if (!raw) return new ApiError(fallback, null, response.status);
  try {
    const body = JSON.parse(raw);
    const domainError = Array.isArray(body?.errors) ? body.errors[0] : null;
    const message =
      domainError?.message ?? body?.detail ?? body?.title ?? body?.message ?? fallback;
    return new ApiError(message, domainError?.code ?? null, response.status);
  } catch {
    return new ApiError(raw, null, response.status);
  }
};

// --- Core request helper ---

export const apiRequest = async <T>(path: string, options: RequestInit = {}) => {
  const token = getStoredAccessToken();
  const headers = new Headers(options.headers);

  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("ngrok-skip-browser-warning", "true");
  if (!headers.has("Accept-Language")) headers.set("Accept-Language", getAcceptLanguage());

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
    if (!retryHeaders.has("Accept-Language")) retryHeaders.set("Accept-Language", getAcceptLanguage());

    const retryResponse = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: retryHeaders });

    if (!retryResponse.ok) {
      throw await readError(retryResponse);
    }

    if (retryResponse.status === 204) return undefined as T;
    const retryText = await retryResponse.text();
    return retryText ? (JSON.parse(retryText) as T) : (undefined as T);
  }

  if (!response.ok) {
    const error = await readError(response);

    if (response.status >= 500) {
      _onServerError?.(path);
    }

    throw error;
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
};
