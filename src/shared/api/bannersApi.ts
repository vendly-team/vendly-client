import { apiRequest, API_BASE_URL } from './http';

// Matches MultiLanguageField on the backend (uz/ru/en/cyrl)
export type MultiLang = {
  uz?: string | null;
  ru?: string | null;
  en?: string | null;
  cyrl?: string | null;
};

export type HeroBannerDto = {
  id: number;
  title: MultiLang;
  subtitle: MultiLang;
  badgeText: MultiLang | null;
  ctaText: MultiLang;
  ctaLink: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type BannerFormData = {
  title: MultiLang;
  subtitle: MultiLang;
  badgeText: MultiLang | null;
  ctaText: MultiLang;
  ctaLink: string;
  sortOrder: number;
  isActive: boolean;
  image: File | null;
};

// Convert relative URL from storage to full URL
export const getBannerImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (/^(blob:|data:|https?:\/\/)/.test(url)) return url;
  return `${API_BASE_URL}/${url.replace(/^\/+/, '')}`;
};

// Serialize form data + files → FormData for multipart/form-data
const toFormData = (data: BannerFormData): FormData => {
  const fd = new FormData();

  // MultiLang fields → JSON strings
  fd.append('Title', JSON.stringify(data.title));
  fd.append('Subtitle', JSON.stringify(data.subtitle));
  fd.append('BadgeText', JSON.stringify(data.badgeText ?? {}));
  fd.append('CtaText', JSON.stringify(data.ctaText));
  fd.append('CtaLink', data.ctaLink);
  fd.append('SortOrder', String(data.sortOrder));
  fd.append('IsActive', String(data.isActive));

  if (data.image) fd.append('Image', data.image);

  return fd;
};

export const bannersApi = {
  // Storefront — active only, localized by Accept-Language
  getActive: () => apiRequest<HeroBannerDto[]>('/api/hero-banners'),

  // Admin — all banners
  getAll: () => apiRequest<HeroBannerDto[]>('/api/hero-banners/all'),

  getById: (id: number) => apiRequest<HeroBannerDto>(`/api/hero-banners/${id}`),

  create: (data: BannerFormData) =>
    apiRequest<HeroBannerDto>('/api/hero-banners', {
      method: 'POST',
      body: toFormData(data),
    }),

  update: (id: number, data: BannerFormData) =>
    apiRequest<HeroBannerDto>(`/api/hero-banners/${id}`, {
      method: 'PUT',
      body: toFormData(data),
    }),

  delete: (id: number) =>
    apiRequest<void>(`/api/hero-banners/${id}`, { method: 'DELETE' }),

  toggleActive: (id: number) =>
    apiRequest<void>(`/api/hero-banners/${id}/toggle`, { method: 'PATCH' }),
};
