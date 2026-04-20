import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '@/shared/data/products';
import { categories } from '@/shared/data/categories';
import { toast } from 'sonner';
import { Lock, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ProductFormPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = id ? products.find(p => p.id === id) : null;
  const isEdit = !!existing;

  const [form, setForm] = useState({
    name: existing?.name || '', sku: existing?.sku || '', categoryId: existing?.categoryId || '',
    description: existing?.description || '', price: existing?.price?.toString() || '', salePrice: existing?.salePrice?.toString() || '',
    stock: existing?.stock?.toString() || '0', isActive: existing?.isActive ?? true,
    images: existing?.images || [''], specifications: existing?.specifications || [{ key: '', value: '' }],
    slug: existing?.slug || '', metaTitle: '', metaDescription: '',
  });

  const isExternal = existing?.syncSource === 'external';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.name.length < 3) { toast.error(t('products.errors.nameMin')); return; }
    if (!form.sku) { toast.error(t('products.errors.skuRequired')); return; }
    if (!form.categoryId) { toast.error(t('products.errors.categoryRequired')); return; }
    if (!form.price || Number(form.price) <= 0) { toast.error(t('products.errors.validPrice')); return; }
    if (form.salePrice && Number(form.salePrice) >= Number(form.price)) { toast.error(t('products.errors.salePriceLess')); return; }
    toast.success(isEdit ? t('products.success.updated') : t('products.success.created'));
    navigate('/admin/products');
  };

  const u = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-display font-bold mb-6">{isEdit ? t('products.editProduct') : t('products.newProduct')}</h1>
      {isExternal && (
        <div className="flex items-center gap-2 bg-warning/10 border border-warning/30 rounded-lg px-4 py-3 mb-6 text-sm text-warning">
          <AlertTriangle size={18} /> {t('products.syncWarning')}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">{t('products.basicInfo')}</h3>
          <div><label className="text-sm font-medium">{t('common.name')} *</label><input value={form.name} onChange={e => u('name', e.target.value)} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">{t('common.sku')} *</label><input value={form.sku} onChange={e => u('sku', e.target.value)} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" /></div>
            <div><label className="text-sm font-medium">{t('common.category')} *</label><select value={form.categoryId} onChange={e => u('categoryId', e.target.value)} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1"><option value="">{t('products.select')}</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          </div>
          <div><label className="text-sm font-medium">{t('common.slug')}</label><input value={form.slug} onChange={e => u('slug', e.target.value)} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => u('isActive', e.target.checked)} /> {t('common.active')}</label>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">{t('common.description')}</h3>
          <textarea value={form.description} onChange={e => u('description', e.target.value)} className="w-full h-32 p-3 glass-input rounded-md text-sm resize-none" placeholder={t('products.htmlSupported')} />
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">{t('products.pricingStock')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium flex items-center gap-1">{t('products.basePrice')} * {isExternal && <Lock size={14} className="text-warning" />}</label><input type="number" value={form.price} onChange={e => u('price', e.target.value)} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" /></div>
            <div><label className="text-sm font-medium">{t('products.salePrice')}</label><input type="number" value={form.salePrice} onChange={e => u('salePrice', e.target.value)} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" /></div>
          </div>
          <div><label className="text-sm font-medium flex items-center gap-1">{t('common.stock')} * {isExternal && <Lock size={14} className="text-warning" />}</label><input type="number" value={form.stock} onChange={e => u('stock', e.target.value)} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" /></div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">{t('products.images')}</h3>
          {form.images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input value={img} onChange={e => { const imgs = [...form.images]; imgs[i] = e.target.value; u('images', imgs); }} placeholder={t('products.imageUrl')} className="flex-1 h-10 px-3 glass-input rounded-md text-sm" />
              {img && <img src={img} className="w-10 h-10 rounded bg-muted object-cover" alt="" />}
            </div>
          ))}
          <button type="button" onClick={() => u('images', [...form.images, ''])} className="text-sm text-accent hover:underline">{t('products.addImage')}</button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">{t('products.specifications')}</h3>
          {form.specifications.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input value={s.key} onChange={e => { const specs = [...form.specifications]; specs[i] = { ...specs[i], key: e.target.value }; u('specifications', specs); }} placeholder={t('products.key')} className="flex-1 h-10 px-3 glass-input rounded-md text-sm" />
              <input value={s.value} onChange={e => { const specs = [...form.specifications]; specs[i] = { ...specs[i], value: e.target.value }; u('specifications', specs); }} placeholder={t('products.value')} className="flex-1 h-10 px-3 glass-input rounded-md text-sm" />
              <button type="button" onClick={() => u('specifications', form.specifications.filter((_, j) => j !== i))} className="text-destructive text-sm">×</button>
            </div>
          ))}
          <button type="button" onClick={() => u('specifications', [...form.specifications, { key: '', value: '' }])} className="text-sm text-accent hover:underline">{t('products.addSpec')}</button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">{t('products.seo')}</h3>
          <div><label className="text-sm font-medium">{t('products.metaTitle')}</label><input value={form.metaTitle} onChange={e => u('metaTitle', e.target.value)} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" /></div>
          <div>
            <label className="text-sm font-medium">{t('products.metaDescription')}</label>
            <textarea value={form.metaDescription} onChange={e => u('metaDescription', e.target.value.slice(0, 160))} className="w-full h-20 p-3 glass-input rounded-md text-sm resize-none mt-1" maxLength={160} />
            <p className="text-xs text-muted-foreground mt-1">{form.metaDescription.length}/160</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="h-11 px-8 bg-accent text-accent-foreground rounded-lg font-semibold text-sm">{t('common.save')}</button>
          <button type="button" onClick={() => navigate('/admin/products')} className="h-11 px-8 border border-border rounded-lg text-sm">{t('common.cancel')}</button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
