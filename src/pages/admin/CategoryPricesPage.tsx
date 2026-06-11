import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  categoryPricesApi,
  MarkupType,
  type CategoryPriceDto,
} from '@/shared/api/categoryPricesApi';
import { categoriesApi, type CategoryDto } from '@/shared/api/categoriesApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Form = {
  categoryId: number | '';
  markupType: MarkupType;
  value: string;
  roundingStep: string;
  startDate: string;
  endDate: string;
};

const emptyForm = (): Form => ({
  categoryId: '',
  markupType: MarkupType.Percent,
  value: '',
  roundingStep: '',
  startDate: '',
  endDate: '',
});

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : '');
const formatNumber = (n: number) => n.toLocaleString('ru-RU');

const CategoryPricesPage = () => {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<CategoryPriceDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach(c => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const load = async () => {
    setLoading(true);
    try {
      const [prices, cats] = await Promise.all([
        categoryPricesApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setItems(prices);
      setCategories(cats);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('categoryPrices.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [i18n.language]);

  const openAdd = () => {
    setForm(emptyForm());
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (item: CategoryPriceDto) => {
    setEditId(item.id);
    setForm({
      categoryId: item.categoryId,
      markupType: item.markupType,
      value: String(item.value),
      roundingStep: item.roundingStep === null ? '' : String(item.roundingStep),
      startDate: toDateInput(item.startDate),
      endDate: toDateInput(item.endDate),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (form.categoryId === '') { toast.error(t('categoryPrices.errors.categoryRequired')); return; }
    if (form.value === '' || Number(form.value) < 0) { toast.error(t('categoryPrices.errors.valueInvalid')); return; }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      toast.error(t('categoryPrices.errors.dateRange'));
      return;
    }

    const payload = {
      categoryId: Number(form.categoryId),
      markupType: form.markupType,
      value: Number(form.value),
      roundingStep: form.roundingStep === '' ? null : Number(form.roundingStep),
      startDate: form.startDate ? `${form.startDate}T00:00:00` : null,
      endDate: form.endDate ? `${form.endDate}T23:59:59` : null,
    };

    setSaving(true);
    try {
      if (editId !== null) {
        await categoryPricesApi.update(editId, payload);
        toast.success(t('categoryPrices.success.updated'));
      } else {
        await categoryPricesApi.create(payload);
        toast.success(t('categoryPrices.success.created'));
      }
      await load();
      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('categoryPrices.errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('categoryPrices.deleteConfirm'))) return;
    try {
      await categoryPricesApi.delete(id);
      await load();
      toast.success(t('common.delete'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('categoryPrices.errors.deleteFailed'));
    }
  };

  const renderValue = (item: CategoryPriceDto) =>
    item.markupType === MarkupType.Percent
      ? `${formatNumber(item.value)}%`
      : `${formatNumber(item.value)} ${t('categoryPrices.currency')}`;

  const renderRange = (item: CategoryPriceDto) => {
    const start = toDateInput(item.startDate);
    const end = toDateInput(item.endDate);
    if (!start && !end) return '—';
    return `${start || '…'} → ${end || '…'}`;
  };

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground">
        {t('categoryPrices.title')}
      </h1>

      <div className="flex justify-end rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 h-9 px-4 bg-accent text-accent-foreground rounded-lg text-[14px] font-semibold tracking-[-0.011em] hover:bg-accent/90 transition-colors"
        >
          <Plus size={15} />
          {t('common.add')}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="w-10">#</TableHead>
              <TableHead>{t('categoryPrices.col.category')}</TableHead>
              <TableHead>{t('categoryPrices.col.type')}</TableHead>
              <TableHead>{t('categoryPrices.col.value')}</TableHead>
              <TableHead>{t('categoryPrices.col.rounding')}</TableHead>
              <TableHead>{t('categoryPrices.col.range')}</TableHead>
              <TableHead className="sticky right-0 w-28 bg-muted/40 border-l border-border/50 text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-[14px] text-muted-foreground">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            )}
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-[14px] text-muted-foreground">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            )}
            {!loading && items.map((item, idx) => (
              <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="text-[13px] text-muted-foreground">{idx + 1}</TableCell>
                <TableCell>
                  <div className="text-[14px] font-medium tracking-[-0.011em] text-foreground">
                    {categoryNameById.get(item.categoryId) ?? `#${item.categoryId}`}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={item.markupType === MarkupType.Percent ? 'secondary' : 'outline'}>
                    {item.markupType === MarkupType.Percent ? t('categoryPrices.type.percent') : t('categoryPrices.type.fixed')}
                  </Badge>
                </TableCell>
                <TableCell className="text-[14px] font-medium text-foreground">{renderValue(item)}</TableCell>
                <TableCell className="text-[13px] text-muted-foreground">
                  {item.roundingStep === null ? t('categoryPrices.defaultLabel') : formatNumber(item.roundingStep)}
                </TableCell>
                <TableCell className="text-[13px] text-muted-foreground">{renderRange(item)}</TableCell>
                <TableCell className="sticky right-0 bg-card border-l border-border/50">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-accent/10 hover:text-accent"
                      onClick={() => openEdit(item)}
                      title={t('common.edit')}
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => void handleDelete(item.id)}
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
          className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display">
                {editId !== null ? t('categoryPrices.editRule') : t('categoryPrices.addRule')}
              </h3>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-medium tracking-[-0.006em]">{t('categoryPrices.form.category')} *</label>
                <select
                  value={form.categoryId}
                  onChange={e => setForm(f => ({ ...f, categoryId: e.target.value === '' ? '' : Number(e.target.value) }))}
                  className="mt-2 w-full px-3 py-2 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em]"
                >
                  <option value="">—</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium tracking-[-0.006em]">{t('categoryPrices.form.type')} *</label>
                  <select
                    value={form.markupType}
                    onChange={e => setForm(f => ({ ...f, markupType: Number(e.target.value) as MarkupType }))}
                    className="mt-2 w-full px-3 py-2 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em]"
                  >
                    <option value={MarkupType.Percent}>{t('categoryPrices.typeOption.percent')}</option>
                    <option value={MarkupType.Fixed}>{t('categoryPrices.typeOption.fixed')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium tracking-[-0.006em]">
                    {(form.markupType === MarkupType.Percent ? t('categoryPrices.form.valuePercent') : t('categoryPrices.form.valueFixed'))} *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.value}
                    onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                    className="mt-2 w-full px-3 py-2 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium tracking-[-0.006em]">{t('categoryPrices.form.roundingStep')}</label>
                <input
                  type="number"
                  min={0}
                  placeholder={t('categoryPrices.form.roundingPlaceholder')}
                  value={form.roundingStep}
                  onChange={e => setForm(f => ({ ...f, roundingStep: e.target.value }))}
                  className="mt-2 w-full px-3 py-2 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em]"
                />
                <p className="mt-1 text-[12px] text-muted-foreground">{t('categoryPrices.form.roundingHint')}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium tracking-[-0.006em]">{t('categoryPrices.form.startDate')}</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="mt-2 w-full px-3 py-2 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em]"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium tracking-[-0.006em]">{t('categoryPrices.form.endDate')}</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="mt-2 w-full px-3 py-2 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em]"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-[15px] tracking-[-0.014em] mt-4 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPricesPage;
