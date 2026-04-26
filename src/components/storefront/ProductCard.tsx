import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/shared/types";
import { useCartStore } from "@/shared/store/cartStore";
import { useWishlistStore } from "@/shared/store/wishlistStore";
import { formatPrice, getDiscountPercent } from "@/shared/utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const ProductCard = ({ product }: { product: Product }) => {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.productIds.includes(product.id));
  const discount = product.salePrice ? getDiscountPercent(product.price, product.salePrice) : 0;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  return (
    <div className="group relative bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      {discount > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-sale text-white text-xs font-bold px-2 py-0.5 rounded-md">
          −{discount}%
        </span>
      )}
      <button
        onClick={() => toggle(product.id)}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-colors ${isWishlisted ? 'text-sale' : 'text-muted-foreground hover:text-sale'}`}
        aria-label={t("productCard.toggleWishlist")}
      >
        <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>

      <Link to={`/product/${product.slug}`} className="block aspect-square bg-muted overflow-hidden">
        <img src={product.images[0] || '/placeholder.svg'} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
            <span className="bg-card text-foreground font-bold px-4 py-2 rounded text-sm">{t("productCard.outOfStock")}</span>
          </div>
        )}
      </Link>

      <div className="p-3 space-y-1.5 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug hover:text-accent transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className={i < Math.floor(product.rating) ? "fill-warning text-warning" : "text-border"} />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">({product.reviewCount})</span>
        </div>
        {isLowStock && <p className="text-[11px] text-warning font-medium">{t("productCard.onlyLeft", { count: product.stock })}</p>}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2 mb-2">
            {product.salePrice ? (
              <>
                <span className="text-base font-bold text-sale">{formatPrice(product.salePrice)}</span>
                <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
            )}
          </div>
          <button
            onClick={() => { if (!isOutOfStock) { addItem(product); toast.success(t("productCard.success.addedToCart", { name: product.name })); } }}
            disabled={isOutOfStock}
            className="w-full h-9 rounded-md bg-accent text-accent-foreground text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={14} />
            {t("productCard.addToCart")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
