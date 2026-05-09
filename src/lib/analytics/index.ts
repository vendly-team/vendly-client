export { analyticsConfig } from './config'
export type { AnalyticsConfig, AnalyticsEnv } from './config'
export { pushToDataLayer } from './dataLayer'
export type { GA4Item, PurchaseData } from './events'
export {
  trackPageView,
  trackViewItemList,
  trackSelectItem,
  trackViewItem,
  trackSearch,
  trackAddToCart,
  trackRemoveFromCart,
  trackViewCart,
  trackBeginCheckout,
  trackAddShippingInfo,
  trackAddPaymentInfo,
  trackLogin,
  trackSignUp,
  trackPurchase,
} from './events'
export { usePageTracking } from './usePageTracking'
