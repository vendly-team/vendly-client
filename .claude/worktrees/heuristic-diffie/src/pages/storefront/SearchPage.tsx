import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ProductCard from '@/components/storefront/ProductCard';
import { products } from '@/shared/data/products';
import { Search, X } from 'lucide-react';

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [query, setQuery] = useState(q);
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('search-history') || '[]'); } catch { return []; }
  });

  useEffect(() => { setQuery(q); }, [q]);

  const results = useMemo(() => {
    if (!q) return [];
    const term = q.toLowerCase();
    return products.filter((p) => p.isActive && (p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)));
  }, [q]);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setParams({ q: searchTerm.trim() });
    const updated = [searchTerm.trim(), ...history.filter((h) => h !== searchTerm.trim())].slice(0, 5);
    setHistory(updated);
    localStorage.setItem('search-history', JSON.stringify(updated));
  };

  const removeHistory = (term: string) => {
    const updated = history.filter((h) => h !== term);
    setHistory(updated);
    localStorage.setItem('search-history', JSON.stringify(updated));
  };

  return (
    <StorefrontLayout>
      <div className="container py-6 animate-fade-in">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="max-w-xl mx-auto mb-6">
          <div className="relative">
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for appliances..."
              className="w-full h-12 pl-4 pr-12 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" autoFocus />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent"><Search size={20} /></button>
          </div>
        </form>

        {history.length > 0 && !q && (
          <div className="max-w-xl mx-auto mb-6">
            <p className="text-sm text-muted-foreground mb-2">Recent Searches</p>
            <div className="flex flex-wrap gap-2">
              {history.map((h) => (
                <span key={h} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-muted/80" onClick={() => handleSearch(h)}>
                  {h} <button onClick={(e) => { e.stopPropagation(); removeHistory(h); }}><X size={14} /></button>
                </span>
              ))}
            </div>
          </div>
        )}

        {q && (
          <p className="text-sm text-muted-foreground mb-4">{results.length} result{results.length !== 1 ? 's' : ''} for "{q}"</p>
        )}

        {q && results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : q ? (
          <div className="text-center py-20">
            <Search className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">Try a different search term</p>
          </div>
        ) : null}
      </div>
    </StorefrontLayout>
  );
};

export default SearchPage;
