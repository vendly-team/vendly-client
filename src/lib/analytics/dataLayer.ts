import { analyticsConfig } from './config'

export function pushToDataLayer(event: Record<string, unknown>): void {
  if (!analyticsConfig.enabled) return
  try {
    // gtm.ts initializes window.dataLayer before any push — this is a safety guard
    window.dataLayer = window.dataLayer ?? []
    window.dataLayer.push({
      ...event,
      // Tag every event with environment — useful for filtering in GA4/GTM
      analytics_env: analyticsConfig.environment,
    })
    // Log events in non-production for debugging (visible in browser console)
    if (analyticsConfig.environment !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[Analytics dataLayer]', event)
    }
  } catch {
    // Analytics failure must never crash the app
  }
}
