import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ProductCard from '@/components/storefront/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';
import { categoriesApi, mapCategoryDto } from '@/shared/api/categoriesApi';
import { productService } from '@/features/products/services/productService';
import { mapProductDetailToStorefrontProduct, mapProductListFallback } from '@/features/products/services/storefrontProductMapper';
import type { Category, Product } from '@/shared/types';

const CategoryPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const perPage = 12;
  const category = categories.find((c) => c.slug === slug);

  useEffect(() => {
    const loadCategoryProducts = async () => {
      setLoading(true);
      try {
        const [categoryDtos, productList] = await Promise.all([
          categoriesApi.getAll(),
          productService.getAll(),
        ]);
        const mappedCategories = categoryDtos.map(mapCategoryDto).filter(item => item.isActive);
        setCategories(mappedCategories);

        const details = await Promise.all(
          productList
            .filter(product => product.isActive)
            .map(async product => {
              try {
                return mapProductDetailToStorefrontProduct(await productService.getById(product.id));
              } catch {
                return mapProductListFallback(product);
              }
            }),
        );
        setProducts(details.filter(product => product.isActive));
      } catch {
        setCategories([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    void loadCategoryProducts();
  }, []);

  const filtered = useMemo(() => {
    let list = category ? products.filter((p) => p.categoryId === category.id && p.isActive) : products.filter((p) => p.isActive);
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
  }, [category, inStockOnly, onSaleOnly, priceMax, priceMin, products, sort]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const resetFilters = () => { setPriceMin(''); setPriceMax(''); setOnSaleOnly(false); setInStockOnly(false); setPage(1); };

  const FilterPanel = () => (
    <div className="space-y-4">
      <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] font-display text-foreground">{t('categoryPage.filters')}</h3>
      <div>
        <label className="text-[13px] font-medium tracking-[-0.006em] text-foreground">{t('categoryPage.priceRange')}</label>
        <div className="flex gap-2 mt-1">
          <input type="number" placeholder={t('categoryPage.min')} value={priceMin} onChange={(e) => { setPriceMin(e.target.value); setPage(1); }} className="w-full h-9 px-2 border border-border rounded text-[14px] font-normal tracking-[-0.011em] tabular-nums bg-background" />
          <input type="number" placeholder={t('categoryPage.max')} value={priceMax} onChange={(e) => { setPriceMax(e.target.value); setPage(1); }} className="w-full h-9 px-2 border border-border rounded text-[14px] font-normal tracking-[-0.011em] tabular-nums bg-background" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-[14px] font-normal tracking-[-0.006em]">
        <input type="checkbox" checked={onSaleOnly} onChange={(e) => { setOnSaleOnly(e.target.checked); setPage(1); }} className="rounded border-border" /> {t('categoryPage.onSaleOnly')}
      </label>
      <label className="flex items-center gap-2 text-[14px] font-normal tracking-[-0.006em]">
        <input type="checkbox" checked={inStockOnly} onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }} className="rounded border-border" /> {t('categoryPage.inStockOnly')}
      </label>
      <button onClick={resetFilters} className="text-[13px] font-medium tracking-[-0.006em] text-accent hover:underline">{t('categoryPage.resetFilters')}</button>
    </div>
  );

  return (
    <StorefrontLayout>
      <div className="container py-6 animate-fade-in">
        <div className="flex items-center gap-2 text-[13px] font-normal tracking-[-0.006em] text-muted-foreground mb-4">
          <Link to="/" className="hover:text-accent">{t('nav.home')}</Link> <span>/</span>
          <span className="text-foreground font-medium">{category?.name || t('categoryPage.allProducts')}</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground">{category?.name || t('categoryPage.allProducts')}</h1>
          <div className="flex items-center gap-3">
            <button className="md:hidden flex items-center gap-1 text-[14px] font-medium tracking-[-0.011em] text-foreground border border-border rounded-md px-3 py-1.5" onClick={() => setMobileFiltersOpen(true)}>
              <SlidersHorizontal size={16} /> {t('categoryPage.filters')}
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 px-3 glass-input rounded-md text-[14px] font-normal tracking-[-0.011em] text-foreground">
              <option value="newest">{t('categoryPage.newestFirst')}</option>
              <option value="price-asc">{t('categoryPage.priceLowHigh')}</option>
              <option value="price-desc">{t('categoryPage.priceHighLow')}</option>
              <option value="rating">{t('categoryPage.highestRated')}</option>
            </select>
          </div>
        </div>
        <div className="flex gap-6">
          <aside className="hidden md:block w-56 shrink-0">
            <div className="bg-card p-4 rounded-lg border border-border sticky top-24"><FilterPanel /></div>
          </aside>
          <div className="flex-1">
            {loading ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
                {t('products.loading', { defaultValue: 'Loading products...' })}
              </div>
            ) : paged.length > 0 ? (
              <>
                <p className="text-[13px] font-normal tracking-[-0.006em] text-muted-foreground mb-4">{t('categoryPage.productsFound', { count: filtered.length })}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {paged.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)} className="h-9 px-3 border border-border rounded text-[13px] font-medium tracking-[-0.006em] disabled:opacity-50">{t('common.prev')}</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i} onClick={() => setPage(i + 1)} className={`h-9 w-9 rounded text-[13px] font-medium tracking-[-0.006em] tabular-nums ${page === i + 1 ? 'bg-accent text-accent-foreground' : 'border border-border'}`}>{i + 1}</button>
                    ))}
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="h-9 px-3 border border-border rounded text-[13px] font-medium tracking-[-0.006em] disabled:opacity-50">{t('common.next')}</button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <SlidersHorizontal className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display text-foreground mb-2">{t('categoryPage.noProducts')}</h3>
                <button onClick={resetFilters} className="text-[14px] font-medium tracking-[-0.011em] text-accent hover:underline">{t('categoryPage.resetFilters')}</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/50 md:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-72 bg-card p-6 animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] font-display">{t('categoryPage.filters')}</h3>
              <button onClick={() => setMobileFiltersOpen(false)}><X size={20} /></button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </StorefrontLayout>
  );
};

export default CategoryPage;
