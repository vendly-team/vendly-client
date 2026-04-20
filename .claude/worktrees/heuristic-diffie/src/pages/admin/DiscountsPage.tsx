import { useState } from 'react';
import { discounts as initial } from '@/shared/data/discounts';
import { categories } from '@/shared/data/categories';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';

const DiscountsPage = () => {
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
        <h1 className="text-2xl font-display font-bold">Discounts</h1>
        <button onClick={() => { setForm({ name: '', type: 'percentage', value: '', appliesTo: 'all', categoryIds: [], startDate: '', endDate: '', isActive: true }); setModalOpen(true); }} className="flex items-center gap-2 h-10 px-4 bg-accent text-accent-foreground rounded-lg text-sm font-medium"><Plus size={16} /> Add Discount</button>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Value</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Period</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>{list.map(d => (
            <tr key={d.id} className="border-b border-border last:border-0"><td className="px-4 py-3 font-medium">{d.name}</td><td className="px-4 py-3">{d.type === 'percentage' ? '%' : '$'}</td><td className="px-4 py-3">{d.value}{d.type === 'percentage' ? '%' : '$'}</td><td className="px-4 py-3 text-muted-foreground text-xs">{d.startDate} — {d.endDate}</td><td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${d.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{d.isActive ? 'Active' : 'Inactive'}</span></td><td className="px-4 py-3"><button onClick={() => handleDelete(d.id)} className="text-destructive hover:underline text-xs">Delete</button></td></tr>
          ))}</tbody>
        </table>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">New Discount</h3><button onClick={() => setModalOpen(false)}><X size={20} /></button></div>
            <div className="space-y-3">
              <input placeholder="Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full h-10 px-3 glass-input rounded-md text-sm" />
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="w-full h-10 px-3 glass-input rounded-md text-sm"><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount ($)</option></select>
              <input type="number" placeholder="Value *" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="w-full h-10 px-3 glass-input rounded-md text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">Start</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full h-10 px-3 glass-input rounded-md text-sm" /></div>
                <div><label className="text-xs text-muted-foreground">End</label><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full h-10 px-3 glass-input rounded-md text-sm" /></div>
              </div>
              <select value={form.appliesTo} onChange={e => setForm({...form, appliesTo: e.target.value as any})} className="w-full h-10 px-3 glass-input rounded-md text-sm"><option value="all">All Products</option><option value="category">By Category</option><option value="products">Specific Products</option></select>
            </div>
            <button onClick={handleSave} className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-sm mt-4">Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountsPage;
