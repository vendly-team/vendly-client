export type BtsRegion = {
  id: number
  code: string
  name: string
}

export type BtsCity = {
  id: number
  regionCode: string
  code: string
  name: string
}

export type BtsBranch = {
  id: number
  regionCode: string
  cityCode: string
  code: string
  name: string
  address: string
  phone?: string | null
  /** "lat,long" string as returned by BTS, e.g. "41.311081,69.240562" */
  latLong?: string | null
  workingHours?: unknown
  syncedAt: string
}
