import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { analyticsConfig } from './config'
import { trackPageView } from './events'

// ⚠ KNOWN LIMITATION: react-helmet-async updates document.title asynchronously.
// On route change, document.title may still show the previous page's title when this
// hook fires. We use requestAnimationFrame to give Helmet one render cycle to apply.
// page_path and page_location are reliable. page_title is best-effort in an SPA.
// For strict title accuracy, consider passing the title explicitly from each page.

export function usePageTracking(): void {
  const location = useLocation()
  const lastPathRef = useRef<string | null>(null)

  useEffect(() => {
    if (!analyticsConfig.enabled) return

    const path = location.pathname + location.search

    // Prevent duplicate page_view on re-renders that don't change the path
    if (lastPathRef.current === path) return
    lastPathRef.current = path

    // One animation frame delay lets Helmet apply the page title before we read it
    requestAnimationFrame(() => {
      trackPageView(path, document.title, window.location.href)
    })
  }, [location])
}
