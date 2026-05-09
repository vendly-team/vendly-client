export type PageType = 'public' | 'private'

// Indexing is only enabled when both:
//   1. VITE_SEO_INDEXING_ENABLED=true (set only in production env files)
//   2. VITE_ANALYTICS_ENV=production (ensures build mode matches)
// This prevents staging builds from accidentally being indexed even if flag is wrong.
export function isIndexingEnabled(): boolean {
  return (
    import.meta.env.VITE_SEO_INDEXING_ENABLED === 'true' &&
    import.meta.env.VITE_ANALYTICS_ENV === 'production'
  )
}

// Returns the appropriate robots meta content for a given page type.
// 'private' pages are ALWAYS noindex regardless of environment.
// 'public' pages are indexable only when isIndexingEnabled() returns true.
export function getRobotsDirective(pageType: PageType): string {
  if (!isIndexingEnabled() || pageType === 'private') {
    return 'noindex,nofollow'
  }
  return 'index,follow'
}

// Builds an absolute canonical URL from a relative path.
// VITE_PUBLIC_SITE_URL must be set per environment.
export function getCanonicalUrl(path: string): string {
  const base = (import.meta.env.VITE_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}
