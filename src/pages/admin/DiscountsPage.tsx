import { useState } from 'react';
import { discounts as initial } from '@/shared/data/discounts';
import { categories } from '@/shared/data/categories';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DiscountsPage = () => {
  const { t } = useTranslation();
  const [list, setList] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'percentage' as 'percentage'|'fixed', value: '', appliesTo: 'all' as 'all'|'category'|'products', categoryIds: [] as string[], startDate: '', endDate: '', isActive: true });

  const handleSave = () => {
    if (!form.name || !form.value || !form.startDate || !form.endDate) { toast.error('Fill all required fields'); return; }
    setList([...list, { id: String(Date.now()), ...form, value: Number(form.value) }]);
    setModalOpen(false);
    toast.success('Discount created');
  };

  const handleDelete = (id: string) => { setList(list.filter(d => d.id !== id)); toast.success('Discount deleted'); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">{t('discounts.title')}</h1>
        <button onClick={() => { setForm({ name: '', type: 'percentage', value: '', appliesTo: 'all', categoryIds: [], startDate: '', endDate: '', isActive: true }); setModalOpen(true); }} className="flex items-center gap-2 h-10 px-4 bg-accent text-accent-foreground rounded-lg text-sm font-medium"><Plus size={16} /> {t('discounts.addDiscount')}</button>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.name')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('discounts.type')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('discounts.value')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('discounts.period')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.status')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.actions')}</th></tr></thead>
          <tbody>{list.map(d => (
            <tr key={d.id} className="border-b border-border last:border-0"><td className="px-4 py-3 font-medium">{d.name}</td><td className="px-4 py-3">{d.type === 'percentage' ? '%' : '$'}</td><td className="px-4 py-3">{d.value}{d.type === 'percentage' ? '%' : '$'}</td><td className="px-4 py-3 text-muted-foreground text-xs">{d.startDate} — {d.endDate}</td><td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${d.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{d.isActive ? t('common.active') : t('common.inactive')}</span></td><td className="px-4 py-3"><button onClick={() => handleDelete(d.id)} className="text-destructive hover:underline text-xs">{t('common.delete')}</button></td></tr>
          ))}</tbody>
        </table>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">{t('discounts.newDiscount')}</h3><button onClick={() => setModalOpen(false)}><X size={20} /></button></div>
            <div className="space-y-3">
              <input placeholder={`${t('common.name')} *`} value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full h-10 px-3 glass-input rounded-md text-sm" />
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="w-full h-10 px-3 glass-input rounded-md text-sm"><option value="percentage">{t('discounts.percentage')}</option><option value="fixed">{t('discounts.fixedAmount')}</option></select>
              <input type="number" placeholder={`${t('discounts.value')} *`} value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="w-full h-10 px-3 glass-input rounded-md text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">{t('discounts.start')}</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full h-10 px-3 glass-input rounded-md text-sm" /></div>
                <div><label className="text-xs text-muted-foreground">{t('discounts.end')}</label><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full h-10 px-3 glass-input rounded-md text-sm" /></div>
              </div>
              <select value={form.appliesTo} onChange={e => setForm({...form, appliesTo: e.target.value as any})} className="w-full h-10 px-3 glass-input rounded-md text-sm"><option value="all">{t('discounts.allProducts')}</option><option value="category">{t('discounts.byCategory')}</option><option value="products">{t('discounts.specificProducts')}</option></select>
            </div>
            <button onClick={handleSave} className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-sm mt-4">{t('common.save')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountsPage;
