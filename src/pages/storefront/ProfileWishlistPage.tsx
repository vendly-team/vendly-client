import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlistStore } from '@/shared/store/wishlistStore';
import { useCartStore } from '@/shared/store/cartStore';
import { products } from '@/shared/data/products';
import { formatPrice } from '@/shared/utils';
import { Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import RecentlyViewedSection from '@/components/storefront/RecentlyViewedSection';

const ProfileWishlistPage = () => {
  const { t } = useTranslation();
  const { productIds, toggle } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const wishlistProducts = products.filter((p) => productIds.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <div>
        <div className="text-center py-20">
          <Heart className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-2">{t('wishlist.empty')}</h3>
          <Link to="/" className="text-[14px] font-medium tracking-[-0.011em] text-accent hover:underline">{t('wishlist.browse')}</Link>
        </div>
        <RecentlyViewedSection className="py-8" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground mb-6">{t('wishlist.title')}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlistProducts.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-lg overflow-hidden">
            <Link to={`/product/${p.slug}`} className="block aspect-square bg-muted">
              <img src={p.images[0] || '/placeholder.svg'} alt={p.name} className="w-full h-full object-contain" />
            </Link>
            <div className="p-3">
              <Link to={`/product/${p.slug}`} className="text-[14px] font-semibold tracking-[-0.011em] text-foreground hover:text-accent line-clamp-2">{p.name}</Link>
              <p className="text-[16px] font-bold tracking-[-0.014em] text-foreground mt-1 tabular-nums">{formatPrice(p.salePrice ?? p.price)}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => { addItem(p); toast.success(t('productPage.success.addedToCart', { name: p.name })); }} className="flex-1 h-9 bg-accent text-accent-foreground rounded-md text-[12px] font-semibold tracking-[-0.005em] flex items-center justify-center gap-1"><ShoppingCart size={14} /> {t('wishlist.addToCart')}</button>
                <button onClick={() => toggle(p.id)} className="h-9 w-9 border border-border rounded-md flex items-center justify-center text-sale"><Heart size={16} fill="currentColor" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileWishlistPage;
