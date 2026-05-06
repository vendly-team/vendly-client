import { useTranslation } from 'react-i18next'
import { Search, AlertCircle } from 'lucide-react'
import { SearchResultCard } from './SearchResultCard'
import type { ProductSearchResponse } from '@/features/products/types'

export type SearchSuggestionsPanelProps = {
  query: string
  results: ProductSearchResponse[]
  loading: boolean
  error: string | null
  /** Index of the keyboard-highlighted item (-1 = none). */
  activeIndex: number
  onHover: (index: number) => void
  onNavigate: () => void
  onViewAll: () => void
  /** Maximum number of results visible in the dropdown. */
  maxItems?: number
  className?: string
}

const SkeletonRow = () => (
  <div className="flex items-center gap-3 p-2">
    <div className="w-12 h-12 rounded-md bg-muted animate-pulse shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
      <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
    </div>
  </div>
)

export function SearchSuggestionsPanel({
  query,
  results,
  loading,
  error,
  activeIndex,
  onHover,
  onNavigate,
  onViewAll,
  maxItems = 6,
  className = '',
}: SearchSuggestionsPanelProps) {
  const { t } = useTranslation()
  const visible = results.slice(0, maxItems)

  return (
    <div className={`bg-card overflow-hidden ${className}`}>
      {loading && (
        <div className="p-3 space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="px-4 py-6 flex items-start gap-3">
          <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold tracking-[-0.006em] text-foreground">
              {t('searchPage.errorTitle')}
            </p>
            <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground mt-0.5 break-words">
              {error}
            </p>
          </div>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="px-4 py-8 flex flex-col items-center text-center">
          <Search size={28} className="text-muted-foreground mb-2" aria-hidden="true" />
          <p className="text-[14px] font-semibold tracking-[-0.011em] text-foreground">
            {t('searchPage.noResults')}
          </p>
          <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground mt-0.5">
            {t('searchPage.tryDifferent')}
          </p>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <>
          <div className="p-2 space-y-0.5" role="listbox" aria-label={t('searchPage.recentSearches')}>
            {visible.map((p, idx) => (
              <SearchResultCard
                key={p.id}
                product={p}
                compact
                active={idx === activeIndex}
                highlight={query}
                onHover={() => onHover(idx)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onViewAll}
            className="block w-full px-4 py-3 border-t border-border text-[13px] font-semibold tracking-[-0.006em] text-accent hover:bg-muted transition-colors text-center"
          >
            {t('searchPage.viewAll', { count: results.length })}
          </button>
        </>
      )}
    </div>
  )
}
