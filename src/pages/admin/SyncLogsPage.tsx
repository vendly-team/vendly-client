import { useState } from 'react';
import { syncLogs as initial } from '@/shared/data/syncLogs';
import { toast } from 'sonner';
import { RefreshCw, X, SearchIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SyncLogsPage = () => {
  const { t, i18n } = useTranslation();
  const [logs, setLogs] = useState(initial);
  const [syncing, setSyncing] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setLogs([
        {
          id: String(Date.now()),
          source: 'SAP B1',
          status: 'success',
          productsUpdated: 3,
          duration: '9s',
          timestamp: new Date().toISOString(),
        },
        ...logs,
      ]);
      setSyncing(false);
      toast.success(t('syncLogs.success.completed', { count: 3 }));
    }, 2000);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">{t('syncLogs.title')}</h1>
        <Button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium"
        >
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? t('syncLogs.syncing') : t('syncLogs.runSync')}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>{t('syncLogs.timestamp')}</TableHead>
            <TableHead>{t('syncLogs.source')}</TableHead>
            <TableHead>{t('common.status')}</TableHead>
            <TableHead>{t('syncLogs.updated')}</TableHead>
            <TableHead>{t('syncLogs.duration')}</TableHead>
            <TableHead className="sticky right-0 w-20 bg-card border-l border-border/40 text-right">
              {t('common.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No sync logs found
              </TableCell>
            </TableRow>
          )}
          {logs.map(l => (
            <TableRow key={l.id}>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {new Date(l.timestamp).toLocaleString(i18n.language)}
              </TableCell>
              <TableCell className="font-medium">{l.source}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={l.status === 'success'
                    ? 'border-success/15 bg-success/10 text-success hover:bg-success/10'
                    : 'border-destructive/15 bg-destructive/10 text-destructive hover:bg-destructive/10'}
                >
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${l.status === 'success' ? 'bg-success' : 'bg-destructive'}`} />
                  {l.status}
                </Badge>
              </TableCell>
              <TableCell className="font-medium tabular-nums">{l.productsUpdated}</TableCell>
              <TableCell className="text-muted-foreground">{l.duration}</TableCell>
              <TableCell className="sticky right-0 bg-card border-l border-border/40">
                <div className="flex justify-end gap-1">
                  {l.errorMessage ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-accent/10 hover:text-accent"
                      onClick={() => setErrorModal(l.errorMessage!)}
                      title={t('syncLogs.viewDetails')}
                    >
                      <SearchIcon size={15} />
                    </Button>
                  ) : (
                    <span className="h-8 w-8" />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {errorModal && (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[6px] flex items-center justify-center p-4"
          onClick={() => setErrorModal(null)}
        >
          <div
            className="bg-card border border-border/60 rounded-[20px] p-7 w-full max-w-md shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[20px] font-semibold tracking-[-0.018em] text-destructive">
                {t('syncLogs.errorDetails')}
              </h3>
              <button
                onClick={() => setErrorModal(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{errorModal}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncLogsPage;
