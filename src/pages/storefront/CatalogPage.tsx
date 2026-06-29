import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ImagePlus, ChevronRight } from 'lucide-react';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { PageMeta } from '@/lib/seo';
import { useCategories } from '@/shared/hooks/useCategories';

const CatalogPage = () => {
  const { t } = useTranslation();
  const { categories, loading } = useCategories({ activeOnly: true });

  return (
    <StorefrontLayout>
      <PageMeta
        title={`${t('nav.catalog')} — Opto Vestor`}
        description="Browse all product categories at wholesale prices on Opto Vestor."
        canonical="/catalog"
        pageType="public"
      />
      <div className="container py-4 sm:py-6 animate-fade-in max-w-3xl mx-auto px-4">
        {loading ? (
          /* Skeleton — horizontal rows */
          <div className="space-y-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
              >
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          /* Category list — horizontal rows */
          <div className="space-y-2.5">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-card transition-all duration-300 hover:border-accent hover:bg-accent/5 active:scale-[0.98] sm:active:scale-100"
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden rounded-xl bg-muted h-14 w-14 sm:h-16 sm:w-16 shrink-0">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImagePlus size={20} className="text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Label + count */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] sm:text-[15px] font-semibold tracking-[-0.011em] text-foreground group-hover:text-accent transition-colors line-clamp-1">
                    {category.name}
                  </h3>
                  <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground mt-0.5">
                    {t('catalogPage.products', { count: category.productCount })}
                  </p>
                </div>

                {/* Chevron */}
                <div className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground group-hover:text-accent group-hover:bg-accent/10 transition-all duration-300 shrink-0">
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-0.5 transition-transform duration-300"
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 px-6 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mb-4">
              <ImagePlus size={28} className="text-muted-foreground" />
            </div>
            <h3 className="text-[16px] sm:text-[18px] font-semibold tracking-[-0.016em] text-foreground mb-1">
              {t('catalogPage.noCategories')}
            </h3>
            <p className="text-[13px] sm:text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
              {t('catalogPage.tryAgain')}
            </p>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default CatalogPage;
