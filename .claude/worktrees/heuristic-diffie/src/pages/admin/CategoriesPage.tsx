import { useState } from 'react';
import { categories as initialCats } from '@/shared/data/categories';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';

const AdminCategoriesPage = () => {
  const [cats, setCats] = useState(initialCats);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', image: '', isActive: true });

  const openAdd = () => { setForm({ name: '', slug: '', image: '', isActive: true }); setEditId(null); setModalOpen(true); };
  const openEdit = (id: string) => { const c = cats.find(c => c.id === id); if (c) { setForm({ name: c.name, slug: c.slug, image: c.image, isActive: c.isActive }); setEditId(id); setModalOpen(true); } };

  const handleSave = () => {
    if (!form.name) { toast.error('Name is required'); return; }
    if (editId) { setCats(cats.map(c => c.id === editId ? { ...c, ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') } : c)); toast.success('Category updated'); }
    else { setCats([...cats, { id: String(Date.now()), ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'), productCount: 0 }]); toast.success('Category created'); }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => { if (confirm('Delete this category?')) { setCats(cats.filter(c => c.id !== id)); toast.success('Category deleted'); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Categories</h1>
        <button onClick={openAdd} className="flex items-center gap-2 h-10 px-4 bg-accent text-accent-foreground rounded-lg text-sm font-medium"><Plus size={16} /> Add Category</button>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Products</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>
            {cats.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                <td className="px-4 py-3">{c.productCount}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${c.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-3 flex gap-2"><button onClick={() => openEdit(c.id)} className="text-accent hover:underline text-xs">Edit</button><button onClick={() => handleDelete(c.id)} className="text-destructive hover:underline text-xs">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">{editId ? 'Edit' : 'Add'} Category</h3><button onClick={() => setModalOpen(false)}><X size={20} /></button></div>
            <div className="space-y-3">
              <div><label className="text-sm font-medium">Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" /></div>
              <div><label className="text-sm font-medium">Slug</label><input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" /></div>
              <div><label className="text-sm font-medium">Image URL</label><input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" /></div>
              {form.image && <img src={form.image} className="w-20 h-20 rounded bg-muted object-cover" alt="" />}
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
            </div>
            <button onClick={handleSave} className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-sm mt-4">Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
