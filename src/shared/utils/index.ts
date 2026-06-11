const PLACEHOLDER_MAP: Record<string, string> = {
  en: '/placeholder-en.png',
  ru: '/placeholder-ru.png',
  uz: '/placeholder-uz.png',
  'uz-Cyrl': '/placeholder-crillic.png',
};

export const getProductPlaceholder = (lang: string): string =>
  PLACEHOLDER_MAP[lang] ?? '/placeholder-en.png';

// Backend narxlarni allaqachon so'mga o'girib qaytaradi (CBU rate + category markup).
// Shuning uchun bu yerda faqat formatlash: ming ajratgich + "so'm".
export const formatPrice = (price: number): string => {
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(price)} so'm`;
};

export const getDiscountPercent = (price: number, salePrice: number): number => {
  return Math.round(((price - salePrice) / price) * 100);
};

export const delay = (ms: number = 800): Promise<void> => new Promise((r) => setTimeout(r, ms));
