import { apiRequest } from "./http";

export type MultiLang = {
  uz?: string | null;
  ru?: string | null;
  en?: string | null;
  cyrl?: string | null;
};

// getAll returns language-specific string values (current locale)
export type ReturnReasonListItem = {
  id: number;
  key: string;
  name: string;
  description: string;
  canResell: boolean;
  createdAt: string;
};

// getById returns full multi-language objects (for admin editing)
export type ReturnReasonDto = {
  id: number;
  key: string;
  name: MultiLang;
  description: MultiLang;
  canResell: boolean;
  createdAt: string;
};

type ReturnReasonPayload = {
  key: string;
  name: MultiLang;
  description: MultiLang;
  canResell: boolean;
};

const JSON_HEADERS = { "Content-Type": "application/json" };
const ALL_LANGS = { "Accept-Language": "ALL" };

export const returnReasonsApi = {
  getAll: (search?: string) =>
    apiRequest<ReturnReasonListItem[]>(`/api/return-reasons${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getById: (id: number) =>
    apiRequest<ReturnReasonDto>(`/api/return-reasons/${id}`, { headers: ALL_LANGS }),
  create: (data: ReturnReasonPayload) =>
    apiRequest<void>("/api/return-reasons", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }),
  update: (id: number, data: ReturnReasonPayload) =>
    apiRequest<void>(`/api/return-reasons/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<void>(`/api/return-reasons/${id}`, { method: "DELETE" }),
};
