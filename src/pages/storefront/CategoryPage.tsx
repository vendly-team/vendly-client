import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useI18nLanguage } from '@/hooks/useI18nLanguage';
import { toast } from 'sonner';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { PageMeta } from '@/lib/seo'
import { trackViewItemList } from '@/lib/analytics'
import type { GA4Item } from '@/lib/analytics'
import ProductCard from '@/components/storefront/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';
import { categoriesApi, mapCategoryDto } from '@/shared/api/categoriesApi';
import { productService } from '@/features/products/services/productService';
import { mapProductCardToStorefrontProduct } from '@/features/products/services/storefrontProductMapper';
import { Paginator } from '@/components/ui/Paginator';
import type { Category, Product } from '@/shared/types';

const CategoryPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const language = useI18nLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalServerPages, setTotalServerPages] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const filtersReadyRef = useRef(false);
  const category = categories.find((c) => c.slug === slug);

  // Reset to page 1 when category slug changes
  useEffect(() => { setPage(1); }, [slug]);

  // Load categories once, re-fetch when language changes
  useEffect(() => {
    categoriesApi.getAll()
      .then(dtos => setCategories(dtos.map(mapCategoryDto).filter(c => c.isActive)))
      .catch(() => setCategories([]));
  }, [language]);

  // Load products when category or page changes
  useEffect(() => {
    if (!category) return;
    setLoading(true);
    productService.getAll({ categoryId: Number(category.id), page, pageSize: 24 })
      .then(result => {
        setProducts(result.items.map(mapProductCardToStorefrontProduct));
        setTotalServerPages(result.totalPages);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category?.id, page, language]);

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileFiltersOpen]);

  useEffect(() => {
    if (!loading) filtersReadyRef.current = true;
  }, [loading]);

  useEffect(() => {
    if (!filtersReadyRef.current) return;
    if (filtered.length === 0) {
      toast.error(t('categoryPage.noProducts'), { duration: 2500 });
    } else {
      toast.success(t('categoryPage.productsFound', { count: filtered.length }), { duration: 2000 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceMin, priceMax, onSaleOnly, inStockOnly, sort]);

  useEffect(() => {
    if (!category || products.length === 0) return
    const ga4Items: GA4Item[] = products.slice(0, 20).map(product => ({
      item_id: String(product.id),
      item_name: product.name,
      item_category: category.name,
      price: product.salePrice ?? product.price,
      quantity: 1,
    }))
    trackViewItemList(category.slug, category.name, ga4Items)
  }, [category?.slug, products.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const closeSheet = () => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileFiltersOpen(false);
      setIsClosing(false);
    }, 280);
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (priceMin) list = list.filter((p) => (p.salePrice ?? p.price) >= Number(priceMin));
    if (priceMax) list = list.filter((p) => (p.salePrice ?? p.price) <= Number(priceMax));
    if (onSaleOnly) list = list.filter((p) => p.salePrice !== undefined);
    if (inStockOnly) list = list.filter((p) => p.stock > 0);
    switch (sort) {
      case 'price-asc': list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)); break;
      case 'price-desc': list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price)); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      default: list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [inStockOnly, onSaleOnly, priceMax, priceMin, products, sort]);

  const resetFilters = () => {
    setPriceMin(''); setPriceMax(''); setOnSaleOnly(false); setInStockOnly(false); setPage(1);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-2">
          {t('categoryPage.priceRange')}
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t('categoryPage.min')}
            value={priceMin}
            onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
            className="w-full h-10 px-3 border border-border rounded-xl text-[14px] tabular-nums bg-background focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
          <input
            type="number"
            placeholder={t('categoryPage.max')}
            value={priceMax}
            onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
            className="w-full h-10 px-3 border border-border rounded-xl text-[14px] tabular-nums bg-background focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-3">
          {t('categoryPage.filters')}
        </p>
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-[15px] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onSaleOnly}
              onChange={(e) => { setOnSaleOnly(e.target.checked); setPage(1); }}
              className="h-5 w-5 rounded-md border-border accent-accent"
            />
            {t('categoryPage.onSaleOnly')}
          </label>
          <label className="flex items-center gap-3 text-[15px] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
              className="h-5 w-5 rounded-md border-border accent-accent"
            />
            {t('categoryPage.inStockOnly')}
          </label>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-2">
          {t('categoryPage.sortBy', { defaultValue: 'Sort' })}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full h-10 px-3 border border-border rounded-xl text-[14px] bg-background focus:outline-none focus:ring-2 focus:ring-accent/25"
        >
          <option value="newest">{t('categoryPage.newestFirst')}</option>
          <option value="price-asc">{t('categoryPage.priceLowHigh')}</option>
          <option value="price-desc">{t('categoryPage.priceHighLow')}</option>
          <option value="rating">{t('categoryPage.highestRated')}</option>
        </select>
      </div>

      <button
        onClick={resetFilters}
        className="w-full h-10 rounded-xl border border-destructive/30 text-destructive text-[14px] font-medium hover:bg-destructive/5 active:scale-[0.98] transition-all"
      >
        {t('categoryPage.resetFilters')}
      </button>
    </div>
  );

  return (
    <StorefrontLayout>
      <PageMeta
        title={category ? `${category.name} — Optoweek` : 'Category — Optoweek'}
        description={category ? `Browse ${category.name} products at wholesale prices on Optoweek.` : undefined}
        canonical={category ? `/category/${category.slug}` : undefined}
        pageType="public"
      />
      <div className="container py-6 animate-fade-in">
        <div className="flex items-center gap-2 text-[13px] font-normal tracking-[-0.006em] text-muted-foreground mb-4">
          <Link to="/" className="hover:text-accent">{t('nav.home')}</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{category?.name || t('categoryPage.allProducts')}</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground">
            {category?.name || t('categoryPage.allProducts')}
          </h1>
          <div className="flex items-center gap-3">
            <button
              className="md:hidden flex items-center gap-1.5 text-[14px] font-medium tracking-[-0.011em] text-foreground border border-border rounded-full px-3.5 py-1.5 active:scale-95 transition-transform"
              onClick={() => { setMobileFiltersOpen(true); setIsClosing(false); }}
            >
              <SlidersHorizontal size={15} />
              {t('categoryPage.filters')}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="hidden md:block h-9 px-3 glass-input rounded-md text-[14px] font-normal tracking-[-0.011em] text-foreground"
            >
              <option value="newest">{t('categoryPage.newestFirst')}</option>
              <option value="price-asc">{t('categoryPage.priceLowHigh')}</option>
              <option value="price-desc">{t('categoryPage.priceHighLow')}</option>
              <option value="rating">{t('categoryPage.highestRated')}</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="hidden md:block w-56 shrink-0">
            <div className="bg-card p-4 rounded-lg border border-border sticky top-24">
              <FilterPanel />
            </div>
          </aside>
          <div className="flex-1">
            {loading ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
                {t('products.loading', { defaultValue: 'Loading products...' })}
              </div>
            ) : filtered.length > 0 ? (
              <>
                <p className="text-[13px] font-normal tracking-[-0.006em] text-muted-foreground mb-4">
                  {t('categoryPage.productsFound', { count: filtered.length })}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                {totalServerPages > 1 && (
                  <div className="mt-8">
                    <Paginator page={page} totalPages={totalServerPages} onChange={setPage} />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <SlidersHorizontal className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display text-foreground mb-2">
                  {t('categoryPage.noProducts')}
                </h3>
                <button onClick={resetFilters} className="text-[14px] font-medium tracking-[-0.011em] text-accent hover:underline">
                  {t('categoryPage.resetFilters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      {mobileFiltersOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] md:hidden transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fade-in'}`}
            onClick={closeSheet}
          />

          {/* Sheet — auto height, capped at 88vh so content is never cut */}
          <div
            className={`fixed inset-x-0 bottom-0 z-[60] md:hidden bg-card rounded-t-[1.75rem] shadow-apple-xl flex flex-col overflow-hidden ${isClosing ? 'animate-slide-out-bottom' : 'animate-slide-in-bottom'}`}
            style={{ maxHeight: 'calc(88vh - env(safe-area-inset-bottom, 0px))' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={17} className="text-accent" />
                <span className="text-[17px] font-semibold tracking-[-0.014em] font-display">
                  {t('categoryPage.filters')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {category && (
                  <span className="text-[12px] font-semibold tracking-[0.01em] text-accent bg-accent/10 px-2.5 py-1 rounded-full max-w-[130px] truncate">
                    {category.name}
                  </span>
                )}
                <button
                  onClick={closeSheet}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/70 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto overscroll-contain px-5 pt-5">
              <FilterPanel />
              {/* Safe-area spacer — padding-bottom unreliable on scroll containers */}
              <div style={{ height: 'calc(1.5rem + env(safe-area-inset-bottom, 24px))' }} aria-hidden="true" />
            </div>
          </div>
        </>
      )}
    </StorefrontLayout>
  );
};

export default CategoryPage;
