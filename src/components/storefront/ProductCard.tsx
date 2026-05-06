import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/shared/types";
import { useCartStore } from "@/shared/store/cartStore";
import { useWishlistToggle } from "@/features/wishlist/hooks/useWishlistToggle";
import { formatPrice, getDiscountPercent } from "@/shared/utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const ProductCard = ({ product }: { product: Product }) => {
  const { t } = useTranslation();
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
    return unique.length > 0 ? unique : ['/placeholder.svg'];
  }, [product.images]);
  const [activeImage, setActiveImage] = useState(0);
  const [isImageHovered, setIsImageHovered] = useState(false);

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
        <span className="absolute top-3 left-3 z-10 bg-sale text-white text-[11px] font-bold tracking-[-0.005em] px-2 py-0.5 rounded-md tabular-nums">
          −{discount}%
        </span>
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
          <div className="absolute inset-0 z-[3] bg-foreground/40 flex items-center justify-center">
            <span className="bg-card text-foreground font-semibold px-4 py-2 rounded text-[13px] tracking-[-0.006em]">{t("productCard.outOfStock")}</span>
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
        {isLowStock && <p className="text-[11px] font-semibold tracking-[-0.005em] text-warning">{t("productCard.onlyLeft", { count: product.stock })}</p>}
        <div className="mt-auto pt-1.5">
          <div className="flex items-baseline gap-2">
            {product.salePrice ? (
              <>
                <span className="text-[16px] font-bold tracking-[-0.014em] text-sale tabular-nums">{formatPrice(product.salePrice)}</span>
                <span className="text-[13px] font-normal tracking-[-0.006em] text-muted-foreground line-through tabular-nums">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-[16px] font-bold tracking-[-0.014em] text-foreground tabular-nums">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
        <div className="pt-2">
          {isAddedToCart ? (
            <div className="flex items-center w-full h-9 rounded-md border border-border overflow-hidden">
              <button
                onClick={() => {
                  const n = qty - 1;
                  if (n <= 0) { updateQty(product.id, 0); setIsAddedToCart(false); setQty(1); }
                  else { setQty(n); updateQty(product.id, n); }
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
                  updateQty(product.id, n);
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
                  addItem(product);
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
