export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/backend").replace(/\/$/, "");

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

export const apiRequest = async <T>(path: string, options: RequestInit = {}) => {
  const token = getStoredAccessToken();
  const headers = new Headers(options.headers);

  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("ngrok-skip-browser-warning", "true");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = await response.json();
      message = body?.detail ?? body?.title ?? body?.message ?? message;
    } catch {
      const text = await response.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
};
