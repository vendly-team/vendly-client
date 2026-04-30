import { type ClipboardEvent, type DragEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Clipboard, ImagePlus, Pencil, Plus, Sparkles, Trash2, UploadCloud, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { categoriesApi, createCategorySlug, mapCategoryDto } from '@/shared/api/categoriesApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type CategoryForm = {
  name: string;
  slug: string;
  image: string;
  imageFile: File | null;
  isActive: boolean;
};

const emptyForm: CategoryForm = { name: '', slug: '', image: '', imageFile: null, isActive: true };

const AdminCategoriesPage = () => {
  const { t } = useTranslation();
  const [cats, setCats] = useState<ReturnType<typeof mapCategoryDto>[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [draggingImage, setDraggingImage] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [initialIsActive, setInitialIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const items = await categoriesApi.getAll();
      setCats(items.map(mapCategoryDto));
      return items;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load categories');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const openAdd = () => { setForm(emptyForm); setSlugManuallyEdited(false); setInitialIsActive(true); setEditId(null); setModalOpen(true); };
  const openEdit = (id: string) => { const c = cats.find(c => c.id === id); if (c) { setForm({ name: c.name, slug: c.slug, image: c.image, imageFile: null, isActive: c.isActive }); setSlugManuallyEdited(false); setInitialIsActive(c.isActive); setEditId(id); setModalOpen(true); } };

  const handleImageFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setForm(current => ({ ...current, image: URL.createObjectURL(file), imageFile: file }));
  };

  const handleImagePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const file = Array.from(event.clipboardData.files).find(item => item.type.startsWith('image/'));
    if (file) { event.preventDefault(); handleImageFile(file); }
  };

  const handleImageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggingImage(false);
    handleImageFile(event.dataTransfer.files[0]);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error(t('common.required')); return; }
    setSaving(true);
    try {
      if (editId) {
        await categoriesApi.update(editId, { name: form.name, image: form.imageFile });
        if (form.isActive !== initialIsActive) await categoriesApi.toggle(editId);
        toast.success('Category updated');
      } else {
        await categoriesApi.create({ name: form.name, image: form.imageFile });
        const items = await loadCategories();
        if (!form.isActive) {
          const created = [...items]
            .filter(item => item.name === form.name)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          if (created) { await categoriesApi.toggle(created.id); await loadCategories(); }
        }
        toast.success('Category created');
      }
      if (editId) await loadCategories();
      setModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('categories.deleteConfirm'))) return;
    try {
      await categoriesApi.delete(id);
      await loadCategories();
      toast.success(t('common.delete'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-5">

      {/* ── 1. Page title ──────────────────────────────────── */}
      <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground">
        {t('categories.title')}
      </h1>

      {/* ── 2. Toolbar surface ─────────────────────────────── */}
      <div className="flex justify-end rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 h-9 px-4 bg-accent text-accent-foreground rounded-lg text-[14px] font-semibold tracking-[-0.011em] hover:bg-accent/90 transition-colors"
        >
          <Plus size={15} />
          {t('categories.addCategory')}
        </button>
      </div>

      {/* ── 3. Table container ─────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="w-20">{t('categories.image', { defaultValue: 'Image' })}</TableHead>
              <TableHead>{t('common.name')}</TableHead>
              <TableHead>{t('common.slug')}</TableHead>
              <TableHead>{t('categories.products')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="sticky right-0 w-28 bg-muted/40 border-l border-border/50 text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
                  Loading categories...
                </TableCell>
              </TableRow>
            )}
            {!loading && cats.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
                  No categories found
                </TableCell>
              </TableRow>
            )}
            {!loading && cats.map(c => (
              <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="h-11 w-14 overflow-hidden rounded-md border border-border bg-muted">
                    {c.image ? (
                      <img src={c.image} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImagePlus size={16} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-[15px] font-semibold tracking-[-0.011em] text-foreground">{c.name}</div>
                </TableCell>
                <TableCell>
                  <span className="rounded bg-muted px-2 py-1 font-mono text-[12px] tracking-[-0.003em] text-muted-foreground">
                    {c.slug}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="rounded-md border-transparent bg-primary/5 text-primary hover:bg-primary/5">
                    {c.productCount}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={c.isActive
                      ? 'border-success/15 bg-success/10 text-success hover:bg-success/10'
                      : 'border-border bg-muted text-muted-foreground hover:bg-muted'}
                  >
                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${c.isActive ? 'bg-success' : 'bg-muted-foreground'}`} />
                    {c.isActive ? t('common.active') : t('common.inactive')}
                  </Badge>
                </TableCell>
                <TableCell className="sticky right-0 bg-card border-l border-border/50">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-accent/10 hover:text-accent"
                      onClick={() => openEdit(c.id)}
                      aria-label={t('common.edit')}
                      title={t('common.edit')}
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => void handleDelete(c.id)}
                      aria-label={t('common.delete')}
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

      {/* Modal — unchanged */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display">
                {editId ? t('categories.editCategory') : t('categories.addCategory')}
              </h3>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[13px] font-medium tracking-[-0.006em]">{t('common.name')} *</label>
                <input
                  value={form.name}
                  onChange={e => {
                    const name = e.target.value;
                    setForm({ ...form, name, slug: slugManuallyEdited ? form.slug : createCategorySlug(name) });
                  }}
                  className="w-full h-10 px-3 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em] mt-1"
                />
              </div>
              <div>
                <label className="text-[13px] font-medium tracking-[-0.006em]">{t('common.slug')}</label>
                <input
                  value={form.slug}
                  onChange={e => { setSlugManuallyEdited(true); setForm({ ...form, slug: createCategorySlug(e.target.value) }); }}
                  className="w-full h-10 px-3 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em] mt-1"
                />
                {slugManuallyEdited && createCategorySlug(form.name) && form.slug !== createCategorySlug(form.name) && (
                  <button
                    type="button"
                    onClick={() => { setForm({ ...form, slug: createCategorySlug(form.name) }); setSlugManuallyEdited(false); }}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2.5 py-1 text-[12px] font-medium tracking-[-0.003em] text-accent transition-colors hover:bg-accent/15"
                  >
                    <Sparkles size={13} />
                    {createCategorySlug(form.name)}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium tracking-[-0.006em]">{t('categories.image', { defaultValue: 'Image' })}</label>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click(); }}
                  onPaste={handleImagePaste}
                  onDragOver={event => { event.preventDefault(); setDraggingImage(true); }}
                  onDragLeave={() => setDraggingImage(false)}
                  onDrop={handleImageDrop}
                  className={`rounded-lg border border-dashed p-3 transition-colors ${draggingImage ? 'border-accent bg-accent/10' : 'border-border bg-muted/30 hover:bg-muted/50'}`}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={event => handleImageFile(event.target.files?.[0])} />
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card">
                      {form.image ? <img src={form.image} className="h-full w-full object-cover" alt="" /> : <ImagePlus size={22} className="text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[14px] font-medium tracking-[-0.011em] text-foreground">
                        <UploadCloud size={16} className="text-accent" />
                        {t('categories.imageDropzoneTitle', { defaultValue: 'Click, paste, or drag image here' })}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] font-normal tracking-[-0.003em] text-muted-foreground">
                        <span>{t('categories.imageFormats', { defaultValue: 'PNG, JPG, WEBP' })}</span>
                        <span className="inline-flex items-center gap-1"><Clipboard size={13} /> {t('categories.pasteSupported', { defaultValue: 'paste supported' })}</span>
                      </div>
                      {form.imageFile && <div className="mt-1 truncate text-[12px] font-medium tracking-[-0.003em] text-accent">{form.imageFile.name}</div>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <div>
                  <div className="text-[14px] font-medium tracking-[-0.011em] text-foreground">{t('common.status')}</div>
                  <div className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground">
                    {form.isActive ? t('common.active') : t('common.inactive')}
                  </div>
                </div>
                <Switch checked={form.isActive} onCheckedChange={checked => setForm({ ...form, isActive: checked })} aria-label={t('common.status')} />
              </div>
            </div>
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-[15px] tracking-[-0.014em] mt-4 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : t('common.save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
