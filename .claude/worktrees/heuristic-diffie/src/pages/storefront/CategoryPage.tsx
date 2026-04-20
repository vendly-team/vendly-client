import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ProductCard from '@/components/storefront/ProductCard';
import { products } from '@/shared/data/products';
import { categories } from '@/shared/data/categories';
import { SlidersHorizontal, X } from 'lucide-react';

const CategoryPage = () => {
  const { slug } = useParams();
  const category = categories.find((c) => c.slug === slug);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const perPage = 12;

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
  }, [category, priceMin, priceMax, onSaleOnly, inStockOnly, sort]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const resetFilters = () => { setPriceMin(''); setPriceMax(''); setOnSaleOnly(false); setInStockOnly(false); setPage(1); };

  const FilterPanel = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Filters</h3>
      <div>
        <label className="text-sm font-medium text-foreground">Price Range</label>
        <div className="flex gap-2 mt-1">
          <input type="number" placeholder="Min" value={priceMin} onChange={(e) => { setPriceMin(e.target.value); setPage(1); }} className="w-full h-9 px-2 border border-border rounded text-sm bg-background" />
          <input type="number" placeholder="Max" value={priceMax} onChange={(e) => { setPriceMax(e.target.value); setPage(1); }} className="w-full h-9 px-2 border border-border rounded text-sm bg-background" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={onSaleOnly} onChange={(e) => { setOnSaleOnly(e.target.checked); setPage(1); }} className="rounded border-border" /> On Sale Only
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={inStockOnly} onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }} className="rounded border-border" /> In Stock Only
      </label>
      <button onClick={resetFilters} className="text-sm text-accent hover:underline">Reset Filters</button>
    </div>
  );

  return (
    <StorefrontLayout>
      <div className="container py-6 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-accent">Home</Link> <span>/</span>
          <span className="text-foreground">{category?.name || 'All Products'}</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">{category?.name || 'All Products'}</h1>
          <div className="flex items-center gap-3">
            <button className="md:hidden flex items-center gap-1 text-sm text-foreground border border-border rounded-md px-3 py-1.5" onClick={() => setMobileFiltersOpen(true)}>
              <SlidersHorizontal size={16} /> Filters
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 px-3 glass-input rounded-md text-sm text-foreground">
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
        <div className="flex gap-6">
          <aside className="hidden md:block w-56 shrink-0">
            <div className="bg-card p-4 rounded-lg border border-border sticky top-24"><FilterPanel /></div>
          </aside>
          <div className="flex-1">
            {paged.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {paged.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)} className="h-9 px-3 border border-border rounded text-sm disabled:opacity-50">Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i} onClick={() => setPage(i + 1)} className={`h-9 w-9 rounded text-sm ${page === i + 1 ? 'bg-accent text-accent-foreground' : 'border border-border'}`}>{i + 1}</button>
                    ))}
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="h-9 px-3 border border-border rounded text-sm disabled:opacity-50">Next</button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <SlidersHorizontal className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="text-lg font-semibold text-foreground mb-2">No products match your filters</h3>
                <button onClick={resetFilters} className="text-accent hover:underline">Reset Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/50 md:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-72 bg-card p-6 animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
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
