import { API_BASE_URL, apiRequest } from "./http";
import type { Category } from "@/shared/types";

export type CategoryDto = {
  id: number;
  name: string;
  slug: string | null;
  imageUrl: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string | null;
};

type CategoryPayload = {
  name: string;
  image?: File | null;
};

const toFormData = (payload: CategoryPayload) => {
  const data = new FormData();
  data.append("Name", payload.name);
  if (payload.image) data.append("Image", payload.image);
  return data;
};

export const getCategoryImageUrl = (imageUrl: string | null | undefined) => {
  if (!imageUrl) return "";
  if (/^(blob:|data:|https?:\/\/)/.test(imageUrl)) return imageUrl;
  return `${API_BASE_URL}/${imageUrl.replace(/^\/+/, "")}`;
};

export const createCategorySlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const mapCategoryDto = (category: CategoryDto): Category => ({
  id: String(category.id),
  name: category.name,
  slug: category.slug || createCategorySlug(category.name),
  image: getCategoryImageUrl(category.imageUrl),
  productCount: category.productCount,
  isActive: category.isActive,
});

export const categoriesApi = {
  getAll: () => apiRequest<CategoryDto[]>("/api/categories"),
  create: (payload: CategoryPayload) =>
    apiRequest<void>("/api/categories", {
      method: "POST",
      body: toFormData(payload),
    }),
  update: (id: string | number, payload: CategoryPayload) =>
    apiRequest<void>(`/api/categories/${id}`, {
      method: "PUT",
      body: toFormData(payload),
    }),
  delete: (id: string | number) =>
    apiRequest<void>(`/api/categories/${id}`, {
      method: "DELETE",
    }),
  toggle: (id: string | number) =>
    apiRequest<void>(`/api/categories/${id}/toggle`, {
      method: "PATCH",
    }),
};
