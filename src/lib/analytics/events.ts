import { pushToDataLayer } from './dataLayer'

// IMPORTANT: Never add PII fields to GA4Item.
// Allowed: product IDs, names, categories, brands, variants, price, quantity.
// Forbidden: email, phone, full name, address, token, card data.
export interface GA4Item {
  item_id: string
  item_name: string
  item_category?: string
  item_brand?: string
  item_variant?: string
  price: number
  quantity: number
}

export interface PurchaseData {
  transaction_id: string  // order number — never PII
  value: number
  currency: string
  tax?: number
  shipping?: number
  coupon?: string
  items: GA4Item[]
}

const CURRENCY = 'UZS'

// Attach currency to every item (required by GA4 ecommerce spec)
function withCurrency(item: GA4Item): GA4Item & { currency: string } {
  return { ...item, currency: CURRENCY }
}

// ─── Page tracking ────────────────────────────────────────────────────────────

export function trackPageView(pagePath: string, pageTitle: string, pageLocation: string): void {
  pushToDataLayer({ event: 'page_view', page_path: pagePath, page_title: pageTitle, page_location: pageLocation })
}

// ─── Product discovery ────────────────────────────────────────────────────────

export function trackViewItemList(listId: string, listName: string, items: GA4Item[]): void {
  pushToDataLayer({
    event: 'view_item_list',
    ecommerce: {
      item_list_id: listId,
      item_list_name: listName,
      items: items.map((item, index) => ({ ...withCurrency(item), index })),
    },
  })
}

export function trackSelectItem(listId: string, listName: string, item: GA4Item): void {
  pushToDataLayer({
    event: 'select_item',
    ecommerce: { item_list_id: listId, item_list_name: listName, items: [withCurrency(item)] },
  })
}

export function trackViewItem(item: GA4Item): void {
  pushToDataLayer({
    event: 'view_item',
    ecommerce: { currency: CURRENCY, value: item.price, items: [withCurrency(item)] },
  })
}

export function trackSearch(searchTerm: string): void {
  pushToDataLayer({ event: 'search', search_term: searchTerm })
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export function trackAddToCart(item: GA4Item, value: number): void {
  pushToDataLayer({
    event: 'add_to_cart',
    ecommerce: { currency: CURRENCY, value, items: [withCurrency(item)] },
  })
}

export function trackRemoveFromCart(item: GA4Item, value: number): void {
  pushToDataLayer({
    event: 'remove_from_cart',
    ecommerce: { currency: CURRENCY, value, items: [withCurrency(item)] },
  })
}

export function trackViewCart(items: GA4Item[], value: number): void {
  pushToDataLayer({
    event: 'view_cart',
    ecommerce: { currency: CURRENCY, value, items: items.map(withCurrency) },
  })
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export function trackBeginCheckout(items: GA4Item[], value: number): void {
  pushToDataLayer({
    event: 'begin_checkout',
    ecommerce: { currency: CURRENCY, value, items: items.map(withCurrency) },
  })
}

export function trackAddShippingInfo(items: GA4Item[], value: number, shippingTier: string): void {
  pushToDataLayer({
    event: 'add_shipping_info',
    ecommerce: { currency: CURRENCY, value, shipping_tier: shippingTier, items: items.map(withCurrency) },
  })
}

export function trackAddPaymentInfo(items: GA4Item[], value: number, paymentType: string): void {
  pushToDataLayer({
    event: 'add_payment_info',
    ecommerce: { currency: CURRENCY, value, payment_type: paymentType, items: items.map(withCurrency) },
  })
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function trackLogin(method: string): void {
  pushToDataLayer({ event: 'login', method })
}

export function trackSignUp(method: string): void {
  pushToDataLayer({ event: 'sign_up', method })
}

// ─── Purchase ─────────────────────────────────────────────────────────────────
// IMPORTANT: Only call this after backend confirms order status is:
//   Confirmed | Paid | CODAccepted | Accepted | Completed
// Never call from CheckoutSuccessPage mount alone.
// See CheckoutSuccessPage.tsx and docs/analytics-seo-cheatsheet.md.

export function trackPurchase(data: PurchaseData): void {
  pushToDataLayer({
    event: 'purchase',
    ecommerce: {
      transaction_id: data.transaction_id,
      value: data.value,
      currency: data.currency,
      tax: data.tax,
      shipping: data.shipping,
      coupon: data.coupon,
      items: data.items.map(item => ({ ...item, currency: data.currency })),
    },
  })
}
