export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

export const getDiscountPercent = (price: number, salePrice: number): number => {
  return Math.round(((price - salePrice) / price) * 100);
};

export const delay = (ms: number = 800): Promise<void> => new Promise((r) => setTimeout(r, ms));
