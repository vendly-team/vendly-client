import { useState } from 'react';
import { syncLogs as initial } from '@/shared/data/syncLogs';
import { toast } from 'sonner';
import { RefreshCw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SyncLogsPage = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState(initial);
  const [syncing, setSyncing] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setLogs([{ id: String(Date.now()), source: 'SAP B1', status: 'success', productsUpdated: 3, duration: '9s', timestamp: new Date().toISOString() }, ...logs]);
      setSyncing(false);
      toast.success(t('syncLogs.success.completed', { count: 3 }));
    }, 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">{t('syncLogs.title')}</h1>
        <button onClick={handleSync} disabled={syncing} className="flex items-center gap-2 h-10 px-4 bg-accent text-accent-foreground rounded-lg text-sm font-medium disabled:opacity-50">
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> {syncing ? t('syncLogs.syncing') : t('syncLogs.runSync')}
        </button>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('syncLogs.timestamp')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('syncLogs.source')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.status')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('syncLogs.updated')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('syncLogs.duration')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.actions')}</th></tr></thead>
          <tbody>{logs.map(l => (
            <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3 text-muted-foreground">{new Date(l.timestamp).toLocaleString()}</td>
              <td className="px-4 py-3">{l.source}</td>
              <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${l.status === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{l.status}</span></td>
              <td className="px-4 py-3">{l.productsUpdated}</td>
              <td className="px-4 py-3 text-muted-foreground">{l.duration}</td>
              <td className="px-4 py-3">{l.errorMessage && <button onClick={() => setErrorModal(l.errorMessage!)} className="text-accent hover:underline text-xs">{t('syncLogs.viewDetails')}</button>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {errorModal && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setErrorModal(null)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-destructive">{t('syncLogs.errorDetails')}</h3><button onClick={() => setErrorModal(null)}><X size={20} /></button></div>
            <p className="text-sm text-muted-foreground">{errorModal}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncLogsPage;
