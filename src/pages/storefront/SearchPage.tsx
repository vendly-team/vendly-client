import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, X, AlertCircle } from 'lucide-react';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { PageMeta } from '@/lib/seo'
import { trackSearch } from '@/lib/analytics'
import { SearchResultCard } from '@/components/storefront/SearchResultCard';
import { useProductSearch } from '@/features/products/hooks/useProductSearch';
import { PRODUCT_SEARCH_MIN_LENGTH } from '@/features/products/types';
import { Skeleton } from '@/components/ui/skeleton';

const HISTORY_KEY = 'search-history';
const MAX_HISTORY = 5;

const readHistory = (): string[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const SearchPage = () => {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get('q') ?? '';

  const [input, setInput] = useState(urlQuery);
  const [history, setHistory] = useState<string[]>(readHistory);

  // Sync input when URL changes externally (e.g. via history nav).
  useEffect(() => {
    setInput(urlQuery);
  }, [urlQuery]);

  const { results, loading, error, tooShort } = useProductSearch(input);

  const submitQuery = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < PRODUCT_SEARCH_MIN_LENGTH) {
      setParams({}, { replace: true });
      return;
    }
    setParams({ q: trimmed });
    trackSearch(trimmed)

    const updated = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, MAX_HISTORY);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  // Keep URL in sync with the live (debounced) query so the page is shareable.
  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed.length >= PRODUCT_SEARCH_MIN_LENGTH) {
      if (trimmed !== urlQuery) {
        const next = new URLSearchParams(params);
        next.set('q', trimmed);
        setParams(next, { replace: true });
      }
    } else if (urlQuery) {
      const next = new URLSearchParams(params);
      next.delete('q');
      setParams(next, { replace: true });
    }
    // Only react to input changes, not URL/setParams identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const removeHistory = (term: string) => {
    const updated = history.filter((h) => h !== term);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const trimmed = input.trim();
  const hasQuery = trimmed.length >= PRODUCT_SEARCH_MIN_LENGTH;
  const showHistory = !hasQuery && !tooShort && history.length > 0;
  const showResults = hasQuery && !loading && !error && results.length > 0;
  const showEmpty = hasQuery && !loading && !error && results.length === 0;
  const showError = hasQuery && !loading && !!error;

  return (
    <StorefrontLayout>
      <PageMeta title="Search — Opto Vestor" pageType="private" />
      <div className="container py-6 animate-fade-in px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitQuery(input);
          }}
          className="max-w-xl mx-auto mb-6"
        >
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('searchPage.placeholder')}
              autoFocus
              className="w-full h-12 pl-4 pr-20 rounded-lg border border-border bg-background text-foreground text-[15px] font-normal tracking-[-0.011em] focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                aria-label={t('common.clear', { defaultValue: 'Clear' })}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent p-1"
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        {tooShort && (
          <p className="max-w-xl mx-auto text-[13px] font-normal tracking-[-0.006em] text-muted-foreground mb-4">
            {t('searchPage.minChars', { count: PRODUCT_SEARCH_MIN_LENGTH })}
          </p>
        )}

        {showHistory && (
          <div className="max-w-xl mx-auto mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-2">
              {t('searchPage.recentSearches')}
            </p>
            <div className="flex flex-wrap gap-2">
              {history.map((h) => (
                <span
                  key={h}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setInput(h);
                    submitQuery(h);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setInput(h);
                      submitQuery(h);
                    }
                  }}
                  className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-[13px] font-medium tracking-[-0.006em] cursor-pointer hover:bg-muted/80"
                >
                  {h}
                  <button
                    type="button"
                    aria-label={t('common.delete')}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHistory(h);
                    }}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {hasQuery && !loading && !error && (
          <p className="text-[13px] font-normal tracking-[-0.006em] text-muted-foreground mb-4">
            {t('searchPage.results', { count: results.length, query: trimmed })}
          </p>
        )}

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {showError && (
          <div className="text-center py-20 max-w-md mx-auto">
            <AlertCircle className="mx-auto mb-4 text-destructive" size={48} />
            <h3 className="text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display text-foreground mb-2">
              {t('searchPage.errorTitle')}
            </h3>
            <p className="text-[15px] font-normal tracking-[-0.011em] text-muted-foreground">
              {error}
            </p>
          </div>
        )}

        {showResults && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((p) => (
              <SearchResultCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {showEmpty && (
          <div className="text-center py-20">
            <Search className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display text-foreground mb-2">
              {t('searchPage.noResults')}
            </h3>
            <p className="text-[15px] font-normal tracking-[-0.011em] text-muted-foreground">
              {t('searchPage.tryDifferent')}
            </p>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default SearchPage;
