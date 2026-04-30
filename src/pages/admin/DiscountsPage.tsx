import { useState } from 'react';
import { discounts as initial } from '@/shared/data/discounts';
import { toast } from 'sonner';
import { Plus, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DiscountsPage = () => {
  const { t } = useTranslation();
  const [list, setList] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    appliesTo: 'all' as 'all' | 'category' | 'products',
    categoryIds: [] as string[],
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const handleSave = () => {
    if (!form.name || !form.value || !form.startDate || !form.endDate) {
      toast.error('Fill all required fields');
      return;
    }
    setList([...list, { id: String(Date.now()), ...form, value: Number(form.value) }]);
    setModalOpen(false);
    toast.success('Discount created');
  };

  const handleDelete = (id: string) => {
    setList(list.filter(d => d.id !== id));
    toast.success('Discount deleted');
  };

  return (
    <div className="space-y-5">

      {/* ── 1. Page title ──────────────────────────────────── */}
      <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground">
        {t('discounts.title')}
      </h1>

      {/* ── 2. Toolbar surface ─────────────────────────────── */}
      <div className="flex justify-end rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <button
          onClick={() => {
            setForm({ name: '', type: 'percentage', value: '', appliesTo: 'all', categoryIds: [], startDate: '', endDate: '', isActive: true });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 h-9 px-4 bg-accent text-accent-foreground rounded-lg text-[14px] font-semibold tracking-[-0.011em] hover:bg-accent/90 transition-colors"
        >
          <Plus size={15} /> {t('discounts.addDiscount')}
        </button>
      </div>

      {/* ── 3. Table container ─────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead>{t('common.name')}</TableHead>
              <TableHead>{t('discounts.type')}</TableHead>
              <TableHead>{t('discounts.value')}</TableHead>
              <TableHead>{t('discounts.period')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="sticky right-0 w-20 bg-muted/40 border-l border-border/50 text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
                  No discounts found
                </TableCell>
              </TableRow>
            )}
            {list.map(d => (
              <TableRow key={d.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="text-[14px] font-semibold tracking-[-0.011em]">{d.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {d.type === 'percentage' ? t('discounts.percentage') : t('discounts.fixedAmount')}
                  </Badge>
                </TableCell>
                <TableCell className="text-[14px] font-semibold tracking-[-0.011em] tabular-nums">
                  {d.value}{d.type === 'percentage' ? '%' : '$'}
                </TableCell>
                <TableCell className="text-muted-foreground text-[12px] font-normal tracking-[-0.003em] whitespace-nowrap tabular-nums">
                  {d.startDate} — {d.endDate}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={d.isActive
                      ? 'border-success/15 bg-success/10 text-success hover:bg-success/10'
                      : 'border-border bg-muted text-muted-foreground hover:bg-muted'}
                  >
                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${d.isActive ? 'bg-success' : 'bg-muted-foreground'}`} />
                    {d.isActive ? t('common.active') : t('common.inactive')}
                  </Badge>
                </TableCell>
                <TableCell className="sticky right-0 bg-card border-l border-border/50">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(d.id)}
                      title={t('common.delete')}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[6px] flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-card border border-border/60 rounded-[20px] p-7 w-full max-w-md shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display">{t('discounts.newDiscount')}</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                placeholder={`${t('common.name')} *`}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full h-10 px-3 glass-input rounded-2xl text-[15px] font-normal tracking-[-0.011em]"
              />
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as 'percentage' | 'fixed' })}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">{t('discounts.percentage')}</SelectItem>
                  <SelectItem value="fixed">{t('discounts.fixedAmount')}</SelectItem>
                </SelectContent>
              </Select>
              <input
                type="number"
                placeholder={`${t('discounts.value')} *`}
                value={form.value}
                onChange={e => setForm({ ...form, value: e.target.value })}
                className="w-full h-10 px-3 glass-input rounded-2xl text-[15px] font-normal tracking-[-0.011em]"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-medium tracking-[-0.003em] text-muted-foreground mb-1 block">{t('discounts.start')}</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full h-10 px-3 glass-input rounded-2xl text-[15px] font-normal tracking-[-0.011em]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium tracking-[-0.003em] text-muted-foreground mb-1 block">{t('discounts.end')}</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full h-10 px-3 glass-input rounded-2xl text-[15px] font-normal tracking-[-0.011em]"
                  />
                </div>
              </div>
              <Select value={form.appliesTo} onValueChange={v => setForm({ ...form, appliesTo: v as 'all' | 'category' | 'products' })}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('discounts.allProducts')}</SelectItem>
                  <SelectItem value="category">{t('discounts.byCategory')}</SelectItem>
                  <SelectItem value="products">{t('discounts.specificProducts')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button
              onClick={handleSave}
              className="w-full h-11 bg-accent text-accent-foreground rounded-full font-semibold text-[15px] tracking-[-0.014em] mt-5 active:scale-[0.97] transition-transform"
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountsPage;
