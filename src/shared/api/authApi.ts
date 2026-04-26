import { apiRequest } from "./http";
import type { User } from "@/shared/types";

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

type JwtPayload = {
  user_id?: string;
  email?: string;
  role?: string;
  exp?: number;
};

type RegisterPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
};

const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
};

export const decodeJwtPayload = (token: string): JwtPayload => {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("Invalid access token");

  return JSON.parse(decodeBase64Url(payload));
};

const normalizeRole = (role?: string): User["role"] => {
  const normalized = role?.toLowerCase();
  if (normalized === "admin" || normalized === "manager" || normalized === "customer") return normalized;
  return "customer";
};

const displayNameFromLogin = (login: string) => {
  const value = login.includes("@") ? login.split("@")[0] : login;
  return value || "User";
};

export const userFromToken = (accessToken: string, loginFallback = ""): User => {
  const payload = decodeJwtPayload(accessToken);
  const email = payload.email ?? (loginFallback.includes("@") ? loginFallback : "");
  const displayName = displayNameFromLogin(email || loginFallback);

  return {
    id: payload.user_id ?? "",
    firstName: displayName,
    lastName: "",
    email,
    phone: loginFallback.includes("@") ? "" : loginFallback,
    role: normalizeRole(payload.role),
  };
};

export const authApi = {
  login: (login: string, password: string) =>
    apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    }),
  register: (payload: RegisterPayload) =>
    apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  refresh: (refreshToken: string) =>
    apiRequest<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }),
  logout: (refreshToken: string) =>
    apiRequest<void>("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }),
};
