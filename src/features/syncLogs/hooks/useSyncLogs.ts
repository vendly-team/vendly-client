import { useState, useCallback } from 'react'
import { syncLogService } from '../services/syncLogService'
import type { PagedList, SyncLogItem } from '../types'

export function useSyncLogs() {
  const [data, setData] = useState<PagedList<SyncLogItem> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const result = await syncLogService.getAll(page)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sync logs')
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetchLogs }
}
