import { Helmet } from 'react-helmet-async'
import { getRobotsDirective, getCanonicalUrl } from './seoConfig'
import type { PageType } from './seoConfig'

// SPA SEO LIMITATION:
// react-helmet-async sets meta tags via JavaScript. Googlebot reads JS-rendered tags.
// Social media crawlers (Facebook, Twitter/X, WhatsApp, Slack) generally do NOT.
// For reliable Open Graph previews, SSR or a prerendering service is required.
// This is an acceptable foundation for the current SPA — see cheatsheet for the future plan.

type PageMetaProps = {
  title: string
  description?: string
  // Relative path, e.g. '/products/my-product'. Converted to absolute using VITE_PUBLIC_SITE_URL.
  canonical?: string
  ogImage?: string
  ogType?: string
  // 'private' pages (cart, checkout, admin, profile, auth) are always noindex.
  // 'public' pages follow environment-aware indexing rules.
  pageType?: PageType
}

export function PageMeta({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  pageType = 'private',
}: PageMetaProps) {
  const robots = getRobotsDirective(pageType)
  const canonicalUrl = canonical ? getCanonicalUrl(canonical) : undefined
  const siteName = 'Opto Vestor'

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="robots" content={robots} />
      {description && <meta name="description" content={description} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      {description && <meta property="og:description" content={description} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  )
}
