export type SyncLogItem = {
  id: number
  source: string
  status: number // 0=Success 1=Partial 2=Error
  totalProcessed: number
  createdCount: number
  updatedCount: number
  errorCount: number
  durationMs: number | null
  startedAt: string
  finishedAt: string | null
  requestUrl: string | null
}

export type SyncLogDetail = SyncLogItem & {
  requestBody: string | null
  response: string | null
  errorDetail: string | null
}

export type PagedList<T> = {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export const SyncStatus = {
  Success: 0,
  Partial: 1,
  Error: 2,
} as const
