import { apiRequest } from "./http";
import type { MultiLang } from "./returnReasonsApi";

// getAll returns language-specific string values (current locale)
export type FaqListItem = {
  id: number;
  question: string;
  answer: string;
  createdAt: string;
};

// getById returns full multi-language objects (for admin editing)
export type FaqDto = {
  id: number;
  question: MultiLang;
  answer: MultiLang;
  createdAt: string;
};

type FaqPayload = {
  question: MultiLang;
  answer: MultiLang;
};

const JSON_HEADERS = { "Content-Type": "application/json" };
const ALL_LANGS = { "Accept-Language": "ALL" };

export const faqsApi = {
  getAll: (search?: string) =>
    apiRequest<FaqListItem[]>(`/api/faqs${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getById: (id: number) =>
    apiRequest<FaqDto>(`/api/faqs/${id}`, { headers: ALL_LANGS }),
  create: (data: FaqPayload) =>
    apiRequest<void>("/api/faqs", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }),
  update: (id: number, data: FaqPayload) =>
    apiRequest<void>(`/api/faqs/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<void>(`/api/faqs/${id}`, { method: "DELETE" }),
};
