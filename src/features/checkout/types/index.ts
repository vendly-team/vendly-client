export type ShippingQuoteRequest = {
  receiverCityCode: string
  receiverBranchCode?: string | null
  weightKg: number
}

export type ShippingQuote = {
  cost: number
  dropoffType: string
  currency: string
}
