import { useState } from 'react';
import { reviews as initialReviews } from '@/shared/data/reviews';
import { products } from '@/shared/data/products';
import { toast } from 'sonner';
import { Star, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminReviewsPage = () => {
  const { t } = useTranslation();
  const [reviewList, setReviewList] = useState(initialReviews);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = filter === 'all' ? reviewList : reviewList.filter(r => r.status === filter);
  const toggleSelect = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const selectAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(r => r.id));

  const updateStatus = (ids: string[], status: 'approved' | 'rejected') => {
    setReviewList(reviewList.map(r => ids.includes(r.id) ? { ...r, status } : r));
    setSelected([]);
    toast.success(t('reviews.success.bulkUpdate', { count: ids.length, status }));
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">{t('reviews.title')}</h1>
      <div className="flex flex-wrap gap-3 mb-4">
        {(['all','pending','approved','rejected'] as const).map(f => {
          const labels: Record<string, string> = { all: t('common.all'), pending: t('reviews.pending'), approved: t('reviews.approved'), rejected: t('reviews.rejected') };
          return <button key={f} onClick={() => setFilter(f)} className={`h-9 px-4 rounded-md text-sm font-medium ${filter === f ? 'bg-accent text-accent-foreground' : 'border border-border'}`}>{labels[f]}</button>;
        })}
      </div>
      {selected.length > 0 && (
        <div className="flex gap-2 mb-4 bg-muted p-3 rounded-lg">
          <span className="text-sm">{selected.length} {t('common.selected')}</span>
          <button onClick={() => updateStatus(selected, 'approved')} className="h-8 px-3 bg-success/10 text-success rounded text-xs font-medium">{t('reviews.approveSelected')}</button>
          <button onClick={() => updateStatus(selected, 'rejected')} className="h-8 px-3 bg-destructive/10 text-destructive rounded text-xs font-medium">{t('reviews.rejectSelected')}</button>
        </div>
      )}
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={selectAll} /></th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.product')}</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.customer')}</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('reviews.rating')}</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('reviews.review')}</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.status')}</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.actions')}</th>
          </tr></thead>
          <tbody>
            {filtered.map(r => {
              const prod = products.find(p => p.id === r.productId);
              return (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} /></td>
                  <td className="px-4 py-3 font-medium">{prod?.name?.slice(0, 30)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.userName}</td>
                  <td className="px-4 py-3 text-warning">{'★'.repeat(r.rating)}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{r.text.slice(0, 80)}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${r.status === 'approved' ? 'bg-success/10 text-success' : r.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>{r.status}</span></td>
                  <td className="px-4 py-3 flex gap-1">
                    <button onClick={() => updateStatus([r.id], 'approved')} className="w-7 h-7 rounded bg-success/10 text-success flex items-center justify-center" title={t('reviews.approve')}><Check size={14} /></button>
                    <button onClick={() => updateStatus([r.id], 'rejected')} className="w-7 h-7 rounded bg-destructive/10 text-destructive flex items-center justify-center" title={t('reviews.reject')}><X size={14} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReviewsPage;
