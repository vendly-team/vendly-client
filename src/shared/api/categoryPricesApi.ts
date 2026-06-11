import { apiRequest } from "./http";

// Backend: VendlyServer.Domain.Enums.PriceMarkupType (int sifatida serialize bo'ladi)
export enum MarkupType {
  Percent = 0,
  Fixed = 1,
}

export type CategoryPriceDto = {
  id: number;
  categoryId: number;
  markupType: MarkupType;
  value: number;
  roundingStep: number | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type CategoryPricePayload = {
  categoryId: number;
  markupType: MarkupType;
  value: number;
  roundingStep: number | null;
  startDate: string | null;
  endDate: string | null;
};

const JSON_HEADERS = { "Content-Type": "application/json" };

export const categoryPricesApi = {
  getAll: (categoryId?: number) =>
    apiRequest<CategoryPriceDto[]>(
      `/api/category-prices${categoryId ? `?categoryId=${categoryId}` : ""}`,
    ),
  getById: (id: number) => apiRequest<CategoryPriceDto>(`/api/category-prices/${id}`),
  create: (data: CategoryPricePayload) =>
    apiRequest<number>("/api/category-prices", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }),
  update: (id: number, data: CategoryPricePayload) =>
    apiRequest<void>(`/api/category-prices/${id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<void>(`/api/category-prices/${id}`, { method: "DELETE" }),
};
