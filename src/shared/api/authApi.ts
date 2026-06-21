import { apiRequest } from "./http";
import type { User } from "@/shared/types";

type ServerUserInfo = {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone: string;
  role: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: ServerUserInfo;
};

// Register endi token bermaydi — OTP yuboriladi.
export type RegisterResponse = {
  phone: string;
  expiresInSeconds: number;
  message: string;
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

export const mapServerUser = (info: ServerUserInfo): User => ({
  id: String(info.id),
  firstName: info.firstName,
  lastName: info.lastName,
  email: info.email ?? "",
  phone: info.phone,
  role: normalizeRole(info.role),
});

export type LoginResponse = AuthResponse | RegisterResponse;

export const authApi = {
  login: (login: string, password: string) =>
    apiRequest<LoginResponse>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    }),
  register: (payload: RegisterPayload) =>
    apiRequest<RegisterResponse>("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  verifyOtp: (phone: string, code: string) =>
    apiRequest<AuthResponse>("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    }),
  resendOtp: (phone: string) =>
    apiRequest<RegisterResponse>("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
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
