import { apiRequest } from '@/shared/api/http'
import type { PagedList, SyncLogDetail, SyncLogItem } from '../types'

export const syncLogService = {
  getAll: (page = 1, pageSize = 20) =>
    apiRequest<PagedList<SyncLogItem>>(`/api/admin/sync-logs?page=${page}&pageSize=${pageSize}`),

  getById: (id: number) =>
    apiRequest<SyncLogDetail>(`/api/admin/sync-logs/${id}`),

  trigger: () =>
    apiRequest('/api/admin/sync-logs/trigger', { method: 'POST' }),
}
