import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';
import { useRecentlyViewed } from '@/features/recently-viewed/hooks/useRecentlyViewed';

interface RecentlyViewedSectionProps {
  excludeProductId?: number;
  limit?: number;
  className?: string;
}

const RecentlyViewedSection = ({ excludeProductId, limit = 8, className }: RecentlyViewedSectionProps) => {
  const { t } = useTranslation();
  const { products } = useRecentlyViewed({ excludeProductId, limit });

  if (products.length === 0) return null;

  return (
    <section className={className ?? 'container py-8'}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[24px] sm:text-[28px] font-display font-bold tracking-[-0.022em] leading-[1.1] text-foreground">
          {t('recentlyViewed.title', { defaultValue: 'Recently viewed' })}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewedSection;
