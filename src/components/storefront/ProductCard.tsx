import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Heart, Minus, Plus, ShoppingCart, Star, Zap } from "lucide-react";
import type { Product } from "@/shared/types";
import { useCartStore } from "@/shared/store/cartStore";
import { useWishlistToggle } from "@/features/wishlist/hooks/useWishlistToggle";
import { formatPrice, getDiscountPercent } from "@/shared/utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useProductPlaceholder } from "@/hooks/useProductPlaceholder";

const ProductCard = ({ product }: { product: Product }) => {
  const { t } = useTranslation();
  const placeholder = useProductPlaceholder();
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const { toggle, isWishlisted: checkWishlisted } = useWishlistToggle();
  const isWishlisted = checkWishlisted(product.id);
  const [qty, setQty] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const discount = product.salePrice ? getDiscountPercent(product.price, product.salePrice) : 0;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;
  const images = useMemo(() => {
    const unique = product.images.filter(Boolean).filter((image, index, list) => list.indexOf(image) === index);
    return unique.length > 0 ? unique : [placeholder];
  }, [product.images, placeholder]);
  const [activeImage, setActiveImage] = useState(0);
  const [isImageHovered, setIsImageHovered] = useState(false);
  // Composite id used by the cart store to key items (matches addItem implementation).
  const cartItemKey = product.variantId ? `${product.id}:${product.variantId}` : product.id;

  useEffect(() => {
    setActiveImage(0);
    setQty(1);
    setIsAddedToCart(false);
  }, [product.id]);

  useEffect(() => {
    if (isImageHovered || images.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveImage(index => (index + 1) % images.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [images.length, isImageHovered]);

  return (
    <div className="group relative bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      {discount > 0 && (
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          <span className="inline-flex items-center gap-0.5 bg-sale text-white text-[12px] font-black px-2.5 py-1 rounded-full shadow-lg tabular-nums leading-none">
            <Zap size={10} className="fill-white shrink-0" />
            −{discount}%
          </span>
          {discount >= 20 && (
            <span className="inline-flex items-center gap-0.5 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow leading-none">
              <Flame size={9} className="fill-white shrink-0" />
              Aktsiya
            </span>
          )}
        </div>
      )}
      <button
        onClick={() => void toggle(product.id)}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-colors ${isWishlisted ? 'text-sale' : 'text-muted-foreground hover:text-sale'}`}
        aria-label={t("productCard.toggleWishlist")}
      >
        <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>

      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-square bg-muted overflow-hidden"
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
      >
        <img src={images[activeImage]} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        {images.length > 1 && (
          <>
            <div className="absolute inset-0 z-[1] flex">
              {images.map((image, index) => (
                <span
                  key={`${image}-${index}`}
                  className="h-full flex-1"
                  onMouseEnter={() => setActiveImage(index)}
                />
              ))}
            </div>
            <div className="pointer-events-none absolute bottom-2 left-2 right-2 z-[2] flex gap-1">
              {images.map((image, index) => (
                <span
                  key={`${image}-dot-${index}`}
                  className={`h-1 flex-1 rounded-full transition-colors ${index === activeImage ? 'bg-accent' : 'bg-background/70'}`}
                />
              ))}
            </div>
          </>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 z-[3] bg-foreground/50 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-card text-foreground font-bold px-5 py-2 rounded-full text-[12px] tracking-wide shadow-lg uppercase">{t("productCard.outOfStock")}</span>
          </div>
        )}
      </Link>

      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-[14px] font-semibold tracking-[-0.011em] text-foreground line-clamp-2 leading-[1.3] hover:text-accent transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className={i < Math.floor(product.rating) ? "fill-warning text-warning" : "text-border"} />
            ))}
          </div>
          <span className="text-[11px] font-normal tracking-[-0.003em] text-muted-foreground tabular-nums">({product.reviewCount})</span>
        </div>
        {isLowStock && (
          <p className="inline-flex items-center gap-1.5 self-start bg-warning/10 text-warning border border-warning/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warning" />
            </span>
            {t("productCard.onlyLeft", { count: product.stock })}
          </p>
        )}
        <div className="mt-auto pt-1.5">
          {product.salePrice ? (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-[16px] font-bold tracking-[-0.014em] text-sale tabular-nums">{formatPrice(product.salePrice)}</span>
                <span className="text-[12px] font-normal text-muted-foreground line-through tabular-nums">{formatPrice(product.price)}</span>
              </div>
              <span className="text-[11px] font-semibold text-sale/80 tabular-nums">
                −{formatPrice(product.price - product.salePrice)} tejaysiz
              </span>
            </div>
          ) : (
            <span className="text-[16px] font-bold tracking-[-0.014em] text-foreground tabular-nums">{formatPrice(product.price)}</span>
          )}
        </div>
        <div className="pt-2">
          {isAddedToCart ? (
            <div className="flex items-center w-full h-9 rounded-md border border-border overflow-hidden">
              <button
                onClick={() => {
                  const n = qty - 1;
                  if (n <= 0) { void updateQty(cartItemKey, 0); setIsAddedToCart(false); setQty(1); }
                  else { setQty(n); void updateQty(cartItemKey, n); }
                }}
                className="flex h-full w-9 shrink-0 items-center justify-center text-foreground hover:bg-muted transition-colors"
              >
                <Minus size={13} />
              </button>
              <span className="flex flex-1 h-full items-center justify-center border-x border-border bg-background text-[13px] font-semibold tabular-nums">{qty}</span>
              <button
                onClick={() => {
                  const n = Math.min(product.stock > 0 ? product.stock : 99, qty + 1);
                  setQty(n);
                  void updateQty(cartItemKey, n);
                }}
                className="flex h-full w-9 shrink-0 items-center justify-center text-foreground hover:bg-muted transition-colors"
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (!isOutOfStock) {
                  void addItem(product);
                  setIsAddedToCart(true);
                  toast.success(t("productCard.success.addedToCart", { name: product.name }));
                }
              }}
              disabled={isOutOfStock}
              className="w-full h-9 rounded-md bg-accent text-accent-foreground text-[13px] font-semibold tracking-[-0.006em] flex items-center justify-center gap-1.5 hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={14} />
              {t("productCard.addToCart")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
