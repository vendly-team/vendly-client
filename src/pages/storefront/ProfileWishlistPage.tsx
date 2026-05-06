import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlistPage } from '@/features/wishlist/hooks/useWishlistPage';
import { Heart, Loader2 } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import RecentlyViewedSection from '@/components/storefront/RecentlyViewedSection';

const ProfileWishlistPage = () => {
  const { t } = useTranslation();
  const { products: wishlistProducts, loading } = useWishlistPage();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {wishlistProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default ProfileWishlistPage;
