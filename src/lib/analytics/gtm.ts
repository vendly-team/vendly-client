import { analyticsConfig } from './config'

// GTM script loaded flag — prevents double injection
let _loaded = false

// Extend Window for dataLayer
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

export function initGTM(): void {
  if (!analyticsConfig.enabled || !analyticsConfig.gtmContainerId || _loaded) return
  _loaded = true

  const id = analyticsConfig.gtmContainerId

  // Initialize dataLayer before GTM script loads
  window.dataLayer = window.dataLayer ?? []

  // Push GTM start event (required by GTM snippet)
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

  // Inject GTM loader script into <head>
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`
  document.head.insertBefore(script, document.head.firstChild)

  // NOTE: <noscript> iframe is NOT injected here.
  // Dynamic JS injection of <noscript> has no effect for users with JS disabled.
  // The app itself requires JS — this tradeoff is acceptable for a JS-heavy SPA.
  // If GTM_CONTAINER_ID is known at build time, a static <noscript> can be added to index.html manually.
}
