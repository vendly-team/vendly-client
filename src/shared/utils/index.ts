const PLACEHOLDER_MAP: Record<string, string> = {
  en: '/placeholder-en.png',
  ru: '/placeholder-ru.png',
  uz: '/placeholder-uz.png',
  'uz-Cyrl': '/placeholder-crillic.png',
};

export const getProductPlaceholder = (lang: string): string =>
  PLACEHOLDER_MAP[lang] ?? '/placeholder-en.png';

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

export const getDiscountPercent = (price: number, salePrice: number): number => {
  return Math.round(((price - salePrice) / price) * 100);
};

export const delay = (ms: number = 800): Promise<void> => new Promise((r) => setTimeout(r, ms));
