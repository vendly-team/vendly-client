import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { RefreshCw, X, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Paginator } from '@/components/ui/Paginator'
import { useSyncLogs } from '@/features/syncLogs/hooks/useSyncLogs'
import { syncLogService } from '@/features/syncLogs/services/syncLogService'
import type { SyncLogDetail } from '@/features/syncLogs/types'
import { SyncStatus } from '@/features/syncLogs/types'

function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  const m = Math.floor(ms / 60_000)
  const s = Math.floor((ms % 60_000) / 1000)
  return `${m}m ${s}s`
}

function StatusBadge({ status }: { status: number }) {
  if (status === SyncStatus.Success)
    return (
      <Badge variant="outline" className="border-success/15 bg-success/10 text-success hover:bg-success/10 gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Success
      </Badge>
    )
  if (status === SyncStatus.Partial)
    return (
      <Badge variant="outline" className="border-warning/15 bg-warning/10 text-warning hover:bg-warning/10 gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
        Partial
      </Badge>
    )
  return (
    <Badge variant="outline" className="border-destructive/15 bg-destructive/10 text-destructive hover:bg-destructive/10 gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
      Error
    </Badge>
  )
}

function JsonBlock({ label, raw }: { label: string; raw: string | null }) {
  if (!raw) return null
  let formatted = raw
  try { formatted = JSON.stringify(JSON.parse(raw), null, 2) } catch { /* keep raw */ }
  return (
    <div>
      <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{label}</p>
      <pre className="text-[11px] font-mono bg-muted/60 border border-border/50 rounded-lg p-3 overflow-auto max-h-56 leading-relaxed whitespace-pre-wrap break-all">
        {formatted}
      </pre>
    </div>
  )
}

const SyncLogsPage = () => {
  const { i18n } = useTranslation()
  const { data, loading, error, fetchLogs } = useSyncLogs()
  const [page, setPage] = useState(1)
  const [syncing, setSyncing] = useState(false)
  const [detail, setDetail] = useState<SyncLogDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => { void fetchLogs(page) }, [page])

  useEffect(() => { if (error) toast.error(error) }, [error])

  const handleSync = async () => {
    setSyncing(true)
    try {
      await syncLogService.trigger()
      toast.success('Sync job enqueued')
      setTimeout(() => void fetchLogs(page), 1500)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to trigger sync')
    } finally {
      setSyncing(false)
    }
  }

  const openDetail = async (id: number) => {
    setDetailLoading(true)
    setDetail(null)
    try {
      const d = await syncLogService.getById(id)
      setDetail(d)
    } catch {
      toast.error('Failed to load detail')
    } finally {
      setDetailLoading(false)
    }
  }

  const handlePageChange = (p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const logs = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display">Sync Logs</h1>
          {data && (
            <p className="text-[13px] text-muted-foreground mt-1">
              {data.totalCount} ta log
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => void fetchLogs(page)}
            disabled={loading}
            className="h-10 w-10 rounded-lg"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button
            onClick={() => void handleSync()}
            disabled={syncing}
            className="flex items-center gap-2 h-10 px-4 rounded-lg text-[14px] font-semibold tracking-[-0.011em]"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Navbatga qo\'shilmoqda…' : 'Sync boshlash'}
          </Button>
        </div>
      </div>

      <div className="rounded-[16px] border border-border/60 overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">+Yaratildi</TableHead>
              <TableHead className="text-right">~Yangilandi</TableHead>
              <TableHead className="text-right">!Xato</TableHead>
              <TableHead className="text-right">Davomiyligi</TableHead>
              <TableHead>Boshlangan vaqt</TableHead>
              <TableHead className="sticky right-0 w-16 bg-card border-l border-border/40 text-right">
                Detail
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-[14px] text-muted-foreground">
                  Yuklanmoqda…
                </TableCell>
              </TableRow>
            )}
            {!loading && logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-[14px] text-muted-foreground">
                  Log topilmadi
                </TableCell>
              </TableRow>
            )}
            {logs.map(log => (
              <TableRow
                key={log.id}
                className="cursor-pointer"
                onClick={() => void openDetail(log.id)}
              >
                <TableCell className="text-[12px] text-muted-foreground tabular-nums font-mono">
                  {log.id}
                </TableCell>
                <TableCell className="text-[13px] font-semibold tracking-[-0.011em] max-w-[140px] truncate">
                  {log.source}
                </TableCell>
                <TableCell>
                  <StatusBadge status={log.status} />
                </TableCell>
                <TableCell className="text-right text-[13px] tabular-nums text-success font-medium">
                  {log.createdCount > 0 ? `+${log.createdCount}` : <span className="text-muted-foreground">0</span>}
                </TableCell>
                <TableCell className="text-right text-[13px] tabular-nums font-medium">
                  {log.updatedCount > 0 ? `~${log.updatedCount}` : <span className="text-muted-foreground">0</span>}
                </TableCell>
                <TableCell className="text-right text-[13px] tabular-nums font-medium">
                  {log.errorCount > 0
                    ? <span className="text-destructive">!{log.errorCount}</span>
                    : <span className="text-muted-foreground">0</span>}
                </TableCell>
                <TableCell className="text-right text-[13px] text-muted-foreground tabular-nums">
                  {formatDuration(log.durationMs)}
                </TableCell>
                <TableCell className="text-[12px] text-muted-foreground tabular-nums whitespace-nowrap">
                  {new Date(log.startedAt).toLocaleString(i18n.language)}
                </TableCell>
                <TableCell
                  className="sticky right-0 bg-card border-l border-border/40"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-accent/10 hover:text-accent"
                      onClick={() => void openDetail(log.id)}
                    >
                      <Eye size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Paginator page={page} totalPages={totalPages} onChange={handlePageChange} />
      </div>

      {/* Detail modal */}
      {(detail || detailLoading) && (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[6px] flex items-start justify-end p-4 sm:p-6"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-card border border-border/60 rounded-[20px] w-full max-w-lg h-full max-h-[calc(100vh-48px)] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-[17px] font-semibold tracking-[-0.014em] font-display">Log #{detail?.id}</h3>
                {detail && <StatusBadge status={detail.status} />}
              </div>
              <button
                onClick={() => setDetail(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {detailLoading && <p className="text-[14px] text-muted-foreground">Yuklanmoqda…</p>}

              {detail && (
                <>
                  {/* Source */}
                  <div>
                    <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Source</p>
                    <p className="text-[14px] font-semibold font-mono">{detail.source}</p>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Jami', value: detail.totalProcessed },
                      { label: 'Yaratildi', value: `+${detail.createdCount}`, cls: 'text-success' },
                      { label: 'Yangilandi', value: `~${detail.updatedCount}` },
                      { label: 'Xato', value: detail.errorCount, cls: detail.errorCount > 0 ? 'text-destructive' : '' },
                    ].map(({ label, value, cls }) => (
                      <div key={label} className="bg-muted/40 rounded-lg p-3 text-center">
                        <p className={`text-[16px] font-bold tabular-nums ${cls ?? ''}`}>{value}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Timing */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Boshlangan</p>
                      <p className="text-[13px] tabular-nums">{new Date(detail.startedAt).toLocaleString(i18n.language)}</p>
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Tugagan</p>
                      <p className="text-[13px] tabular-nums">
                        {detail.finishedAt ? new Date(detail.finishedAt).toLocaleString(i18n.language) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Davomiyligi</p>
                      <p className="text-[13px] tabular-nums">{formatDuration(detail.durationMs)}</p>
                    </div>
                  </div>

                  {/* Request URL */}
                  {detail.requestUrl && (
                    <div>
                      <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Request URL</p>
                      <p className="text-[12px] font-mono bg-muted/60 border border-border/50 rounded-lg px-3 py-2 break-all">
                        {detail.requestUrl}
                      </p>
                    </div>
                  )}

                  <JsonBlock label="Request Body" raw={detail.requestBody} />
                  <JsonBlock label="Response" raw={detail.response} />
                  {detail.errorDetail && (
                    <div>
                      <p className="text-[12px] font-medium text-destructive uppercase tracking-wide mb-1.5">Error Detail</p>
                      <pre className="text-[11px] font-mono bg-destructive/5 border border-destructive/20 rounded-lg p-3 overflow-auto max-h-48 leading-relaxed whitespace-pre-wrap break-all text-destructive">
                        {(() => { try { return JSON.stringify(JSON.parse(detail.errorDetail), null, 2) } catch { return detail.errorDetail } })()}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SyncLogsPage
