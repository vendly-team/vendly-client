import { apiRequest } from '@/shared/api/http'
import type { BtsRegion, BtsCity, BtsBranch } from '../types'

export const btsRefService = {
  getRegions: () => apiRequest<BtsRegion[]>('/api/bts/regions'),

  getCitiesByRegion: (regionCode: string) =>
    apiRequest<BtsCity[]>(`/api/bts/cities?regionCode=${encodeURIComponent(regionCode)}`),

  getBranchesByCity: (cityCode: string) =>
    apiRequest<BtsBranch[]>(`/api/bts/branches?cityCode=${encodeURIComponent(cityCode)}`),

  getBranchesByRegion: (regionCode: string) =>
    apiRequest<BtsBranch[]>(`/api/bts/branches?regionCode=${encodeURIComponent(regionCode)}`),
}
