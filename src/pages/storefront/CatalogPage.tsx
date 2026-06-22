import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ImagePlus } from 'lucide-react';
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
      <div className="container py-4 sm:py-6 animate-fade-in">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-[24px] sm:text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground mb-1">
            {t('catalogPage.title')}
          </h1>
          <p className="text-[13px] sm:text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
            {t('catalogPage.subtitle')}
          </p>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card animate-pulse">
                <div className="h-14 w-14 rounded-lg bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
                <div className="h-4 w-4 rounded bg-muted shrink-0" />
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="space-y-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card transition-all duration-300 hover:border-accent hover:bg-accent/5"
              >
                <div className="overflow-hidden rounded-lg bg-muted h-14 w-14 shrink-0">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImagePlus size={18} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] sm:text-[15px] font-semibold tracking-[-0.011em] text-foreground group-hover:text-accent transition-colors line-clamp-1">
                    {category.name}
                  </h3>
                  <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground">
                    {t('catalogPage.products', { count: category.productCount })}
                  </p>
                </div>
                <div className="text-muted-foreground group-hover:text-accent transition-colors shrink-0">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card p-8 sm:p-12 text-center">
            <ImagePlus className="mx-auto mb-3 text-muted-foreground" size={40} />
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
