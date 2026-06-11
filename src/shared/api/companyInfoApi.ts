import { API_BASE_URL, apiRequest } from "./http";
import type { MultiLang } from "./returnReasonsApi";

// Accept-Language: ALL bilan ofertaUrl to'liq obyekt bo'lib keladi
export type CompanyInfoDto = {
  name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  workingHours: string | null;
  inn: string | null;
  mfo: string | null;
  bankName: string | null;
  accountNumber: string | null;
  telegram: string | null;
  instagram: string | null;
  facebook: string | null;
  youTube: string | null;
  brandName: string | null;
  logoUrl: string | null;
  ofertaUrl: MultiLang;
  updatedAt: string | null;
};

export type CompanyInfoPayload = {
  name: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  inn: string;
  mfo: string;
  bankName: string;
  accountNumber: string;
  telegram: string;
  instagram: string;
  facebook: string;
  youTube: string;
  brandName: string;
  logo?: File | null;
  ofertaUz?: File | null;
  ofertaRu?: File | null;
  ofertaEn?: File | null;
  ofertaCyrl?: File | null;
};

// Saqlangan nisbiy URL'ni to'liq URL'ga aylantiradi (logo / oferta PDF)
export const getFileUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (/^(blob:|data:|https?:\/\/)/.test(url)) return url;
  return `${API_BASE_URL}/${url.replace(/^\/+/, "")}`;
};

const toFormData = (payload: CompanyInfoPayload) => {
  const data = new FormData();
  data.append("Name", payload.name);
  data.append("Phone", payload.phone);
  data.append("Email", payload.email);
  data.append("Address", payload.address);
  data.append("WorkingHours", payload.workingHours);
  data.append("Inn", payload.inn);
  data.append("Mfo", payload.mfo);
  data.append("BankName", payload.bankName);
  data.append("AccountNumber", payload.accountNumber);
  data.append("Telegram", payload.telegram);
  data.append("Instagram", payload.instagram);
  data.append("Facebook", payload.facebook);
  data.append("YouTube", payload.youTube);
  data.append("BrandName", payload.brandName);
  if (payload.logo) data.append("Logo", payload.logo);
  if (payload.ofertaUz) data.append("OfertaUz", payload.ofertaUz);
  if (payload.ofertaRu) data.append("OfertaRu", payload.ofertaRu);
  if (payload.ofertaEn) data.append("OfertaEn", payload.ofertaEn);
  if (payload.ofertaCyrl) data.append("OfertaCyrl", payload.ofertaCyrl);
  return data;
};

// Storefront uchun — ofertaUrl joriy til bo'yicha bitta string bo'lib keladi
export type CompanyInfoPublicDto = Omit<CompanyInfoDto, "ofertaUrl"> & {
  ofertaUrl: string | null;
};

export const companyInfoApi = {
  // Admin tahrir uchun — barcha tillar bilan
  get: () =>
    apiRequest<CompanyInfoDto>("/api/company-info", {
      headers: { "Accept-Language": "ALL" },
    }),
  // Storefront uchun — joriy til (Accept-Language footer'da o'rnatiladi)
  getPublic: () => apiRequest<CompanyInfoPublicDto>("/api/company-info"),
  upsert: (payload: CompanyInfoPayload) =>
    apiRequest<CompanyInfoDto>("/api/company-info", {
      method: "POST",
      body: toFormData(payload),
    }),
};
