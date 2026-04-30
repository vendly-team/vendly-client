import { useState } from 'react';
import { reviews as initialReviews } from '@/shared/data/reviews';
import { products } from '@/shared/data/products';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const statusVariant: Record<string, string> = {
  approved: 'border-success/15 bg-success/10 text-success hover:bg-success/10',
  pending: 'border-warning/15 bg-warning/10 text-warning hover:bg-warning/10',
  rejected: 'border-destructive/15 bg-destructive/10 text-destructive hover:bg-destructive/10',
};

const AdminReviewsPage = () => {
  const { t } = useTranslation();
  const [reviewList, setReviewList] = useState(initialReviews);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = filter === 'all' ? reviewList : reviewList.filter(r => r.status === filter);

  const toggleSelect = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const selectAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(r => r.id));

  const updateStatus = (ids: string[], status: 'approved' | 'rejected') => {
    setReviewList(reviewList.map(r => ids.includes(r.id) ? { ...r, status } : r));
    setSelected([]);
    toast.success(t('reviews.success.bulkUpdate', { count: ids.length, status }));
  };

  const filterLabels: Record<string, string> = {
    all: t('common.all'),
    pending: t('reviews.pending'),
    approved: t('reviews.approved'),
    rejected: t('reviews.rejected'),
  };

  return (
    <div className="space-y-5">

      {/* ── 1. Page title ──────────────────────────────────── */}
      <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground">
        {t('reviews.title')}
      </h1>

      {/* ── 2. Toolbar surface ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-8 px-4 rounded-md text-[13px] font-medium tracking-[-0.006em] transition-colors ${filter === f ? 'bg-accent text-accent-foreground' : 'border border-border hover:bg-muted/50'}`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* ── 2b. Bulk action bar (conditional) ─────────────── */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-muted/50 border border-border/60 px-4 py-3 rounded-xl">
          <span className="text-[14px] font-semibold tracking-[-0.011em]">{selected.length} {t('common.selected')}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 bg-success/10 text-success hover:bg-success/20 hover:text-success"
            onClick={() => updateStatus(selected, 'approved')}
          >
            <Check size={13} className="mr-1.5" />
            {t('reviews.approveSelected')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
            onClick={() => updateStatus(selected, 'rejected')}
          >
            <X size={13} className="mr-1.5" />
            {t('reviews.rejectSelected')}
          </Button>
        </div>
      )}

      {/* ── 3. Table container ─────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={selectAll}
                  className="rounded"
                />
              </TableHead>
              <TableHead>{t('common.product')}</TableHead>
              <TableHead>{t('common.customer')}</TableHead>
              <TableHead>{t('reviews.rating')}</TableHead>
              <TableHead>{t('reviews.review')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="sticky right-0 w-24 bg-muted/40 border-l border-border/50 text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
                  No reviews found
                </TableCell>
              </TableRow>
            )}
            {filtered.map(r => {
              const prod = products.find(p => p.id === r.productId);
              return (
                <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={() => toggleSelect(r.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell className="text-[14px] font-semibold tracking-[-0.011em] max-w-[160px] truncate">
                    {prod?.name?.slice(0, 30)}
                  </TableCell>
                  <TableCell className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{r.userName}</TableCell>
                  <TableCell>
                    <span className="text-warning tracking-tight text-[14px]">{'★'.repeat(r.rating)}</span>
                    <span className="text-muted-foreground/40 text-[14px]">{'★'.repeat(5 - r.rating)}</span>
                  </TableCell>
                  <TableCell className="text-[13px] font-normal tracking-[-0.006em] text-muted-foreground max-w-xs truncate">
                    {r.text.slice(0, 80)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusVariant[r.status] ?? ''}>
                      {t(`reviews.${r.status}`, { defaultValue: r.status })}
                    </Badge>
                  </TableCell>
                  <TableCell className="sticky right-0 bg-card border-l border-border/50">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-success/10 hover:text-success"
                        onClick={() => updateStatus([r.id], 'approved')}
                        title={t('reviews.approve')}
                      >
                        <Check size={15} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => updateStatus([r.id], 'rejected')}
                        title={t('reviews.reject')}
                      >
                        <X size={15} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminReviewsPage;
