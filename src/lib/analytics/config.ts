export type AnalyticsEnv = 'local' | 'staging' | 'production'

export interface AnalyticsConfig {
  enabled: boolean
  environment: AnalyticsEnv
  gtmContainerId: string | null
}

function resolveConfig(): AnalyticsConfig {
  const enabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true'
  const env = (import.meta.env.VITE_ANALYTICS_ENV ?? 'local') as AnalyticsEnv

  // Local env or analytics disabled → always off
  if (!enabled || env === 'local') {
    return { enabled: false, environment: env, gtmContainerId: null }
  }

  let gtmContainerId: string | null = null
  if (env === 'staging') {
    gtmContainerId = import.meta.env.VITE_GTM_CONTAINER_ID_STAGE || null
  } else if (env === 'production') {
    gtmContainerId = import.meta.env.VITE_GTM_CONTAINER_ID_PROD || null
  }

  // Missing GTM ID → disable safely, no error
  if (!gtmContainerId) {
    return { enabled: false, environment: env, gtmContainerId: null }
  }

  return { enabled: true, environment: env, gtmContainerId }
}

// Computed once at module load — VITE_* vars are build-time constants
// WARNING: wrong build mode = wrong analytics config. See docs/analytics-seo-cheatsheet.md
export const analyticsConfig = Object.freeze(resolveConfig())
