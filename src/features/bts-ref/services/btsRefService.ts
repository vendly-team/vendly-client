import { apiRequest } from '@/shared/api/http'
import type { BtsRegion, BtsCity } from '../types'

export const btsRefService = {
  getRegions: () => apiRequest<BtsRegion[]>('/api/bts/regions'),

  getCitiesByRegion: (regionCode: string) =>
    apiRequest<BtsCity[]>(`/api/bts/cities?regionCode=${encodeURIComponent(regionCode)}`),
}
