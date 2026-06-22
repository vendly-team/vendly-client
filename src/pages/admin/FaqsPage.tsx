import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { faqsApi, type FaqListItem } from '@/shared/api/faqsApi';
import type { MultiLang } from '@/shared/api/returnReasonsApi';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const LANG_TABS = ['uz', 'ru', 'en', 'cyrl'] as const;
type LangTab = typeof LANG_TABS[number];

const LANG_LABELS: Record<LangTab, string> = { uz: 'UZ', ru: 'RU', en: 'EN', cyrl: 'Кирилл' };

const emptyLang = (): MultiLang => ({ uz: '', ru: '', en: '', cyrl: '' });

type Form = {
  question: MultiLang;
  answer: MultiLang;
};

const emptyForm = (): Form => ({ question: emptyLang(), answer: emptyLang() });

export function FaqsPage() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<FaqListItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await faqsApi.getAll();
      setItems(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load');
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

  const openEdit = async (id: number) => {
    setEditId(id);
    setForm(emptyForm());
    setModalOpen(true);
    setEditLoading(true);
    try {
      const full = await faqsApi.getById(id);
      setForm({
        question: { uz: full.question.uz ?? '', ru: full.question.ru ?? '', en: full.question.en ?? '', cyrl: full.question.cyrl ?? '' },
        answer: { uz: full.answer.uz ?? '', ru: full.answer.ru ?? '', en: full.answer.en ?? '', cyrl: full.answer.cyrl ?? '' },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load');
      setModalOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.question.uz && !form.question.ru) { toast.error('Question (uz or ru) is required'); return; }
    if (!form.answer.uz && !form.answer.ru) { toast.error('Answer (uz or ru) is required'); return; }
    setSaving(true);
    try {
      if (editId !== null) {
        await faqsApi.update(editId, form);
        toast.success('Updated');
      } else {
        await faqsApi.create(form);
        toast.success('Created');
      }
      await load();
      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await faqsApi.delete(id);
      await load();
      toast.success(t('common.delete'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const setLang = (field: 'question' | 'answer', lang: LangTab, value: string) => {
    setForm(f => ({ ...f, [field]: { ...f[field], [lang]: value } }));
  };

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground">
        {t('admin.sidebar.faqs')}
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
              <TableHead>Question</TableHead>
              <TableHead>Answer</TableHead>
              <TableHead className="sticky right-0 w-28 bg-muted/40 border-l border-border/50 text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-[14px] text-muted-foreground">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            )}
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-[14px] text-muted-foreground">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            )}
            {!loading && items.map((item, idx) => (
              <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="text-[13px] text-muted-foreground">{idx + 1}</TableCell>
                <TableCell>
                  <div className="text-[14px] font-medium tracking-[-0.011em] text-foreground max-w-[280px] line-clamp-2">
                    {item.question || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-[13px] text-muted-foreground max-w-[240px] line-clamp-2">
                    {item.answer || '-'}
                  </div>
                </TableCell>
                <TableCell className="sticky right-0 bg-card border-l border-border/50">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-accent/10 hover:text-accent"
                      onClick={() => void openEdit(item.id)}
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
                {editId !== null ? 'Edit FAQ' : 'Add FAQ'}
              </h3>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>

            {editLoading ? (
              <div className="h-40 flex items-center justify-center text-[14px] text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] font-medium tracking-[-0.006em]">Question *</label>
                  <Tabs defaultValue="uz" className="mt-2">
                    <TabsList className="h-9">
                      {LANG_TABS.map(lang => (
                        <TabsTrigger key={lang} value={lang} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-none">{LANG_LABELS[lang]}</TabsTrigger>
                      ))}
                    </TabsList>
                    {LANG_TABS.map(lang => (
                      <TabsContent key={lang} value={lang} className="mt-2">
                        <textarea
                          value={form.question[lang] ?? ''}
                          onChange={e => setLang('question', lang, e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em] resize-none"
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>

                <div>
                  <label className="text-[13px] font-medium tracking-[-0.006em]">Answer *</label>
                  <Tabs defaultValue="uz" className="mt-2">
                    <TabsList className="h-9">
                      {LANG_TABS.map(lang => (
                        <TabsTrigger key={lang} value={lang} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-none">{LANG_LABELS[lang]}</TabsTrigger>
                      ))}
                    </TabsList>
                    {LANG_TABS.map(lang => (
                      <TabsContent key={lang} value={lang} className="mt-2">
                        <textarea
                          value={form.answer[lang] ?? ''}
                          onChange={e => setLang('answer', lang, e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em] resize-none"
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>
            )}

            {!editLoading && (
              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-[15px] tracking-[-0.014em] mt-4 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? t('common.saving') : t('common.save')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
