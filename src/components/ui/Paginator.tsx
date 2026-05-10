import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginatorProps = {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

function getPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  pages.push(total)

  return pages
}

export function Paginator({ page, totalPages, onChange }: PaginatorProps) {
  if (totalPages <= 1) return null

  const range = getPageRange(page, totalPages)

  return (
    <div className="border-t border-border px-4 py-3 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted/50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <ChevronLeft size={14} />
      </button>

      {range.map((item, i) =>
        item === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="h-8 w-8 flex items-center justify-center text-[13px] text-muted-foreground select-none"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`h-8 w-8 rounded-lg text-[13px] font-medium tracking-[-0.006em] tabular-nums transition-colors ${
              page === item
                ? 'bg-accent text-accent-foreground'
                : 'border border-border hover:bg-muted/50'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted/50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
