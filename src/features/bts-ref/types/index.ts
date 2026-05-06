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
