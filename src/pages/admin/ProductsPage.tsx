import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { products as initialProducts } from '@/shared/data/products';
import { categories } from '@/shared/data/categories';
import { formatPrice } from '@/shared/utils';
import { Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminProductsPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  const filtered = useMemo(() => {
    let list = [...initialProducts];
    if (search) { const s = search.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s)); }
    if (catFilter) list = list.filter(p => p.categoryId === catFilter);
    if (statusFilter) list = list.filter(p => statusFilter === 'active' ? p.isActive : !p.isActive);
    return list;
  }, [search, catFilter, statusFilter]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">{t('products.title')}</h1>
        <Link to="/admin/products/new" className="flex items-center gap-2 h-10 px-4 bg-accent text-accent-foreground rounded-lg text-sm font-medium"><Plus size={16} /> {t('products.addProduct')}</Link>
      </div>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input placeholder={t('products.searchPlaceholder')} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="h-9 pl-9 pr-3 glass-input rounded-md text-sm w-52" /></div>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }} className="h-9 px-3 glass-input rounded-md text-sm"><option value="">{t('products.allCategories')}</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="h-9 px-3 glass-input rounded-md text-sm"><option value="">{t('products.allStatus')}</option><option value="active">{t('common.active')}</option><option value="inactive">{t('common.inactive')}</option></select>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.product')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.sku')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.category')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.price')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.stock')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.status')}</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('common.actions')}</th></tr></thead>
            <tbody>
              {paged.map(p => {
                const cat = categories.find(c => c.id === p.categoryId);
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 flex items-center gap-3"><img src={p.images[0] || '/placeholder.svg'} className="w-10 h-10 rounded bg-muted object-cover" alt="" /><span className="font-medium">{p.name}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.sku}</td>
                    <td className="px-4 py-3 text-muted-foreground">{cat?.name}</td>
                    <td className="px-4 py-3">{p.salePrice ? <><span className="text-sale">{formatPrice(p.salePrice)}</span> <span className="line-through text-muted-foreground text-xs">{formatPrice(p.price)}</span></> : formatPrice(p.price)}</td>
                    <td className={`px-4 py-3 ${p.stock < 5 ? 'text-sale font-medium' : ''}`}>{p.stock}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${p.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{p.isActive ? t('common.active') : t('common.inactive')}</span></td>
                    <td className="px-4 py-3"><Link to={`/admin/products/${p.id}/edit`} className="text-accent hover:underline text-xs">{t('common.edit')}</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && <div className="flex justify-center gap-2 mt-4">{Array.from({ length: totalPages }, (_, i) => <button key={i} onClick={() => setPage(i+1)} className={`h-8 w-8 rounded text-sm ${page === i+1 ? 'bg-accent text-accent-foreground' : 'border border-border'}`}>{i+1}</button>)}</div>}
    </div>
  );
};

export default AdminProductsPage;
