export type BackendCartItem = {
  id: number;
  productVariantId: number;
  productId: number;
  productName: string;
  variantName: string | null;
  price: number;
  images: string[];
  qty: number;
  stock: number;
};

export type BackendCart = {
  id: number;
  items: BackendCartItem[];
  totalAmount: number;
  isLocked: boolean;
};

export type AddCartItemRequest = {
  productVariantId: number;
  qty: number;
};

export type UpdateCartItemRequest = {
  qty: number;
};
