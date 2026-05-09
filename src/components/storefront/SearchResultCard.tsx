import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ImageOff } from 'lucide-react'
import { formatPrice } from '@/shared/utils'
import type { ProductSearchResponse } from '@/features/products/types'

export type SearchResultCardProps = {
  product: ProductSearchResponse
  /** Compact variant for header dropdown / mobile list. Default: false (grid card). */
  compact?: boolean
  /** Highlights this row visually (used by keyboard navigation). */
  active?: boolean
  /** Substring to embolden inside the product name. */
  highlight?: string
  /** Called after the user clicks the link (used to close dropdowns). */
  onNavigate?: () => void
  /** Called when the row is hovered (compact variant only). */
  onHover?: () => void
}

const toRelativeHref = (redirectUrl: string): string => {
  if (!redirectUrl) return '/'
  if (redirectUrl.startsWith('http')) {
    try {
      const url = new URL(redirectUrl)
      return url.pathname + url.search
    } catch {
      return '/'
    }
  }
  return redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const renderHighlighted = (text: string, query: string | undefined) => {
  if (!query) return text
  const trimmed = query.trim()
  if (trimmed.length === 0) return text

  const re = new RegExp(`(${escapeRegExp(trimmed)})`, 'ig')
  const parts = text.split(re)

  return parts.map((part, i) =>
    re.test(part) ? (
      <mark
        key={i}
        className="bg-accent/15 text-accent font-semibold rounded-sm px-0.5"
      >
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

export function SearchResultCard({
  product,
  compact = false,
  active = false,
  highlight,
  onNavigate,
  onHover,
}: SearchResultCardProps) {
  const { t } = useTranslation()
  const href = toRelativeHref(product.redirectUrl)
  const image = product.images?.[0]

  if (compact) {
    return (
      <Link
        to={href}
        onClick={onNavigate}
        onMouseEnter={onHover}
        role="option"
        aria-selected={active}
        className={`flex items-center gap-3 p-2 rounded-md transition-colors duration-150 ${
          active ? 'bg-muted ring-1 ring-accent/30' : 'hover:bg-muted/70'
        }`}
      >
        <div className="w-12 h-12 rounded-md bg-muted shrink-0 overflow-hidden flex items-center justify-center">
          {image ? (
            <img src={image} alt={product.name} className="w-full h-full object-contain" loading="lazy" />
          ) : (
            <ImageOff size={18} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold tracking-[-0.011em] text-foreground line-clamp-1">
            {renderHighlighted(product.name, highlight)}
          </p>
          <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground tabular-nums">
            {formatPrice(product.price)}
          </p>
        </div>
        {!product.isAvailableForSale && (
          <span className="text-[10px] font-semibold tracking-[-0.005em] uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded shrink-0">
            {t('productCard.outOfStock')}
          </span>
        )}
      </Link>
    )
  }

  return (
    <Link
      to={href}
      onClick={onNavigate}
      className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-square bg-muted overflow-hidden flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <ImageOff size={32} className="text-muted-foreground" />
        )}
        {!product.isAvailableForSale && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold tracking-[-0.005em] uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded">
            {t('productCard.outOfStock')}
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <h3 className="text-[14px] font-semibold tracking-[-0.011em] text-foreground line-clamp-2 leading-[1.3] group-hover:text-accent transition-colors">
          {renderHighlighted(product.name, highlight)}
        </h3>

        <div className="mt-auto pt-1.5 flex items-baseline gap-2 flex-wrap">
          <span className="text-[16px] font-bold tracking-[-0.014em] text-foreground tabular-nums">
            {formatPrice(product.price)}
          </span>
          {product.skuCount > 1 && (
            <span className="text-[11px] font-normal tracking-[-0.003em] text-muted-foreground tabular-nums">
              {t('searchPage.variantsCount', { count: product.skuCount })}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
