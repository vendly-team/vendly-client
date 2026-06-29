import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  ImagePlus, Plus, Pencil, Trash2, Upload, X, Loader2, Eye, EyeOff, GripVertical,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  bannersApi, getBannerImageUrl, type HeroBannerDto, type BannerFormData,
} from '@/shared/api/bannersApi';

const LANGS = ['uz', 'ru', 'en', 'cyrl'] as const;
type Lang = typeof LANGS[number];
const LANG_LABELS: Record<Lang, string> = { uz: 'UZ', ru: 'RU', en: 'EN', cyrl: 'Кирилл' };

type MultiLang = Record<Lang, string>;

const emptyMultiLang = (): MultiLang => ({ uz: '', ru: '', en: '', cyrl: '' });

const emptyForm = (): BannerFormData => ({
  title: emptyMultiLang(),
  subtitle: emptyMultiLang(),
  badgeText: emptyMultiLang(),
  ctaText: emptyMultiLang(),
  ctaLink: '/',
  sortOrder: 0,
  isActive: true,
  image: null,
});

// ── UI helpers ──

const Section = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-border bg-card shadow-sm p-5 space-y-4 ${className}`}>
    <h2 className="text-[15px] font-semibold tracking-[-0.011em] text-foreground">{title}</h2>
    {children}
  </div>
);

const MultiLangInput = ({ label, value, onChange }: {
  label: string; value: MultiLang; onChange: (v: MultiLang) => void;
}) => {
  const [activeLang, setActiveLang] = useState<Lang>('uz');
  return (
    <div>
      <label className="text-[13px] font-medium tracking-[-0.006em] text-muted-foreground">{label}</label>
      <div className="mt-1.5 flex items-center gap-1 mb-2">
        {LANGS.map(lang => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveLang(lang)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              activeLang === lang ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {LANG_LABELS[lang]}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={value[activeLang]}
        onChange={e => onChange({ ...value, [activeLang]: e.target.value })}
        className="w-full px-3 py-2 glass-input rounded-md text-[14px] font-normal tracking-[-0.011em]"
      />
    </div>
  );
};

const BannersPage = () => {
  const { t } = useTranslation();
  const [banners, setBanners] = useState<HeroBannerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BannerFormData>(emptyForm());
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<HeroBannerDto | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await bannersApi.getAll();
      setBanners(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('banners.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const preview = useMemo(
    () => imagePreview
      ?? (editingId ? getBannerImageUrl(banners.find(b => b.id === editingId)?.imageUrl ?? null) : null),
    [imagePreview, editingId, banners],
  );

  const handleImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error(t('banners.errors.imageType')); return; }
    setForm(f => ({ ...f, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setImagePreview(null);
    setShowForm(true);
  };

  const openEdit = (banner: HeroBannerDto) => {
    setEditingId(banner.id);
    setForm({
      title: { uz: banner.title.uz ?? '', ru: banner.title.ru ?? '', en: banner.title.en ?? '', cyrl: banner.title.cyrl ?? '' },
      subtitle: { uz: banner.subtitle.uz ?? '', ru: banner.subtitle.ru ?? '', en: banner.subtitle.en ?? '', cyrl: banner.subtitle.cyrl ?? '' },
      badgeText: banner.badgeText
        ? { uz: banner.badgeText.uz ?? '', ru: banner.badgeText.ru ?? '', en: banner.badgeText.en ?? '', cyrl: banner.badgeText.cyrl ?? '' }
        : emptyMultiLang(),
      ctaText: { uz: banner.ctaText.uz ?? '', ru: banner.ctaText.ru ?? '', en: banner.ctaText.en ?? '', cyrl: banner.ctaText.cyrl ?? '' },
      ctaLink: banner.ctaLink,
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
      image: null,
    });
    setImagePreview(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.uz.trim()) { toast.error(t('banners.errors.titleRequired')); return; }
    setSaving(true);
    try {
      if (editingId) {
        await bannersApi.update(editingId, form);
        toast.success(t('banners.success.updated'));
      } else {
        await bannersApi.create(form);
        toast.success(t('banners.success.created'));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('banners.errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await bannersApi.delete(confirmDelete.id);
      toast.success(t('banners.success.deleted'));
      setConfirmDelete(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('banners.errors.deleteFailed'));
    }
  };

  const handleToggle = async (banner: HeroBannerDto) => {
    setTogglingId(banner.id);
    try {
      await bannersApi.toggleActive(banner.id);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('banners.errors.toggleFailed'));
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return <div className="h-40 flex items-center justify-center text-[14px] text-muted-foreground"><Loader2 className="animate-spin" size={20} /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground">
          {t('banners.title')}
        </h1>
        {!showForm && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 h-10 px-4 bg-accent text-accent-foreground rounded-lg font-semibold text-[14px] hover:bg-accent/90 transition-colors"
          >
            <Plus size={18} />
            {t('banners.create')}
          </button>
        )}
      </div>

      {/* Form (create/edit) */}
      {showForm && (
        <Section title={editingId ? t('banners.edit') : t('banners.create')}>
          {/* Image upload */}
          <div>
            <label className="text-[13px] font-medium tracking-[-0.006em] text-muted-foreground">{t('banners.fields.image')}</label>
            <div className="mt-1.5 flex items-center gap-4">
              {preview ? (
                <img src={preview} alt="banner" className="h-20 w-32 rounded-lg object-cover border border-border" />
              ) : (
                <div className="h-20 w-32 rounded-lg border border-dashed border-border flex items-center justify-center">
                  <ImagePlus size={20} className="text-muted-foreground/50" />
                </div>
              )}
              <label className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border bg-card text-[14px] font-medium cursor-pointer hover:bg-muted/40 transition-colors">
                <Upload size={15} />
                {t('banners.fields.uploadImage')}
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImage(e.target.files?.[0])} />
              </label>
              {form.image && (
                <button onClick={() => { setForm(f => ({ ...f, image: null })); setImagePreview(null); }} className="text-muted-foreground hover:text-destructive">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Multilingual text fields */}
          <MultiLangInput label={t('banners.fields.title')} value={form.title as MultiLang} onChange={v => setForm(f => ({ ...f, title: v }))} />
          <MultiLangInput label={t('banners.fields.subtitle')} value={form.subtitle as MultiLang} onChange={v => setForm(f => ({ ...f, subtitle: v }))} />
          <MultiLangInput label={t('banners.fields.badgeText')} value={form.badgeText as MultiLang} onChange={v => setForm(f => ({ ...f, badgeText: v }))} />
          <MultiLangInput label={t('banners.fields.ctaText')} value={form.ctaText as MultiLang} onChange={v => setForm(f => ({ ...f, ctaText: v }))} />

          {/* CTA Link + Sort + Active */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[13px] font-medium tracking-[-0.006em] text-muted-foreground">{t('banners.fields.ctaLink')}</label>
              <input type="text" value={form.ctaLink} onChange={e => setForm(f => ({ ...f, ctaLink: e.target.value }))}
                className="mt-1.5 w-full px-3 py-2 glass-input rounded-md text-[14px]" />
            </div>
            <div>
              <label className="text-[13px] font-medium tracking-[-0.006em] text-muted-foreground">{t('banners.fields.sortOrder')}</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                className="mt-1.5 w-full px-3 py-2 glass-input rounded-md text-[14px]" />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded" />
                <span className="text-[13px] font-medium">{t('banners.fields.active')}</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowForm(false)}
              className="h-10 px-6 border border-border rounded-lg text-[14px] font-medium hover:bg-muted transition-colors">
              {t('common.cancel')}
            </button>
            <button onClick={() => void handleSave()} disabled={saving}
              className="h-10 px-8 bg-accent text-accent-foreground rounded-lg font-semibold text-[14px] disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </Section>
      )}

      {/* Banner list */}
      {!showForm && (
        <>
          {banners.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <ImagePlus className="mx-auto mb-3 text-muted-foreground" size={32} />
              <p className="text-[14px] text-muted-foreground">{t('banners.empty')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {banners.map(banner => (
                <div key={banner.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card">
                  {/* Sort grip */}
                  <GripVertical size={16} className="text-muted-foreground/40 shrink-0" />

                  {/* Thumbnail */}
                  <div className="h-14 w-24 rounded-lg overflow-hidden bg-muted shrink-0">
                    {banner.imageUrl ? (
                      <img src={getBannerImageUrl(banner.imageUrl)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImagePlus size={18} className="text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold tracking-[-0.011em] truncate">{banner.title.uz || banner.title.ru || '(no title)'}</span>
                      {!banner.isActive && (
                        <span className="text-[10px] font-semibold uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{t('banners.inactive')}</span>
                      )}
                    </div>
                    <p className="text-[12px] text-muted-foreground truncate">
                      {t('banners.fields.sortOrder')}: {banner.sortOrder} · {banner.ctaLink}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleToggle(banner)} disabled={togglingId === banner.id}
                      aria-label="Toggle active"
                      className={`p-2 rounded-lg transition-colors ${banner.isActive ? 'text-success hover:bg-success/10' : 'text-muted-foreground hover:bg-muted'}`}>
                      {togglingId === banner.id ? <Loader2 size={16} className="animate-spin" /> : banner.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={() => openEdit(banner)} aria-label={t('common.edit')}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setConfirmDelete(banner)} aria-label={t('common.delete')}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-[18px] font-semibold mb-2">{t('banners.confirmDelete')}</h3>
            <p className="text-[14px] text-muted-foreground mb-1">{confirmDelete.title.uz || confirmDelete.title.ru}</p>
            <p className="text-[13px] text-muted-foreground mb-4">{t('banners.deleteWarning')}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 h-10 border border-border rounded-lg text-[14px] font-medium hover:bg-muted transition-colors">
                {t('common.cancel')}
              </button>
              <button onClick={() => void handleDelete()}
                className="flex-1 h-10 bg-destructive text-destructive-foreground rounded-lg text-[14px] font-semibold hover:bg-destructive/90 transition-colors">
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannersPage;
