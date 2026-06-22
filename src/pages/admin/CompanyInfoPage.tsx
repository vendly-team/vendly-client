import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FileText, Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { companyInfoApi, getFileUrl, type CompanyInfoDto } from '@/shared/api/companyInfoApi';
import type { MultiLang } from '@/shared/api/returnReasonsApi';

const LANGS = ['uz', 'ru', 'en', 'cyrl'] as const;
type Lang = typeof LANGS[number];
const LANG_LABELS: Record<Lang, string> = { uz: 'UZ', ru: 'RU', en: 'EN', cyrl: 'Кирилл' };

type TextField =
  | 'name' | 'phone' | 'email' | 'address' | 'workingHours'
  | 'inn' | 'mfo' | 'bankName' | 'accountNumber'
  | 'telegram' | 'instagram' | 'facebook' | 'youTube' | 'brandName';

type Form = Record<TextField, string>;

const emptyForm = (): Form => ({
  name: '', phone: '', email: '', address: '', workingHours: '',
  inn: '', mfo: '', bankName: '', accountNumber: '',
  telegram: '', instagram: '', facebook: '', youTube: '', brandName: '',
});

// Module darajasida — har render'da remount bo'lmaydi (input fokusi yo'qolmaydi)
const Section = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-border bg-card shadow-sm p-5 space-y-4 ${className}`}>
    <h2 className="text-[15px] font-semibold tracking-[-0.011em] text-foreground">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) => (
  <div>
    <label className="text-[13px] font-medium tracking-[-0.006em] text-muted-foreground">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="mt-1.5 w-full px-3 py-2 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em]"
    />
  </div>
);

const CompanyInfoPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState<Form>(emptyForm());
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [ofertaUrls, setOfertaUrls] = useState<MultiLang>({});
  const [ofertaFiles, setOfertaFiles] = useState<Record<Lang, File | null>>({ uz: null, ru: null, en: null, cyrl: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const logoPreview = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : getFileUrl(logoUrl)),
    [logoFile, logoUrl],
  );

  const applyDto = (dto: CompanyInfoDto) => {
    setForm({
      name: dto.name ?? '', phone: dto.phone ?? '', email: dto.email ?? '',
      address: dto.address ?? '', workingHours: dto.workingHours ?? '',
      inn: dto.inn ?? '', mfo: dto.mfo ?? '', bankName: dto.bankName ?? '', accountNumber: dto.accountNumber ?? '',
      telegram: dto.telegram ?? '', instagram: dto.instagram ?? '', facebook: dto.facebook ?? '', youTube: dto.youTube ?? '',
      brandName: dto.brandName ?? '',
    });
    setLogoUrl(dto.logoUrl);
    setOfertaUrls(dto.ofertaUrl ?? {});
    setLogoFile(null);
    setOfertaFiles({ uz: null, ru: null, en: null, cyrl: null });
  };

  const load = async () => {
    setLoading(true);
    try {
      const dto = await companyInfoApi.get();
      applyDto(dto);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('companyInfo.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const set = (field: TextField) => (value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleLogo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error(t('companyInfo.errors.logoType')); return; }
    setLogoFile(file);
  };

  const handleOferta = (lang: Lang, file?: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error(t('companyInfo.errors.pdfType'));
      return;
    }
    setOfertaFiles(f => ({ ...f, [lang]: file }));
  };

  const handleSave = async () => {
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error(t('companyInfo.errors.email'));
      return;
    }
    setSaving(true);
    try {
      const dto = await companyInfoApi.upsert({
        ...form,
        logo: logoFile,
        ofertaUz: ofertaFiles.uz,
        ofertaRu: ofertaFiles.ru,
        ofertaEn: ofertaFiles.en,
        ofertaCyrl: ofertaFiles.cyrl,
      });
      applyDto(dto);
      toast.success(t('companyInfo.success.saved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('companyInfo.errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-40 flex items-center justify-center text-[14px] text-muted-foreground">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground">
        {t('companyInfo.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start max-w-6xl">
      <Section title={t('companyInfo.sections.branding')}>
        <Field label={t('companyInfo.fields.brandName')} value={form.brandName} onChange={set('brandName')} />
        <div>
          <label className="text-[13px] font-medium tracking-[-0.006em] text-muted-foreground">{t('companyInfo.fields.logo')}</label>
          <div className="mt-1.5 flex items-center gap-4">
            {logoPreview && (
              <img src={logoPreview} alt="logo" className="h-16 w-16 rounded-lg object-contain border border-border bg-muted/30" />
            )}
            <label className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border bg-card text-[14px] font-medium cursor-pointer hover:bg-muted/40 transition-colors">
              <Upload size={15} />
              {t('companyInfo.chooseImage')}
              <input type="file" accept="image/*" className="hidden" onChange={e => handleLogo(e.target.files?.[0])} />
            </label>
            {logoFile && (
              <button onClick={() => setLogoFile(null)} className="text-muted-foreground hover:text-destructive" title={t('common.delete')}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </Section>

      <Section title={t('companyInfo.sections.contact')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('companyInfo.fields.name')} value={form.name} onChange={set('name')} />
          <Field label={t('companyInfo.fields.phone')} value={form.phone} onChange={set('phone')} />
          <Field label={t('companyInfo.fields.email')} value={form.email} onChange={set('email')} type="email" />
          <Field label={t('companyInfo.fields.workingHours')} value={form.workingHours} onChange={set('workingHours')} />
        </div>
        <Field label={t('companyInfo.fields.address')} value={form.address} onChange={set('address')} />
      </Section>

      <Section title={t('companyInfo.sections.legal')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('companyInfo.fields.inn')} value={form.inn} onChange={set('inn')} />
          <Field label={t('companyInfo.fields.mfo')} value={form.mfo} onChange={set('mfo')} />
          <Field label={t('companyInfo.fields.bankName')} value={form.bankName} onChange={set('bankName')} />
          <Field label={t('companyInfo.fields.accountNumber')} value={form.accountNumber} onChange={set('accountNumber')} />
        </div>
      </Section>

      <Section title={t('companyInfo.sections.social')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Telegram" value={form.telegram} onChange={set('telegram')} />
          <Field label="Instagram" value={form.instagram} onChange={set('instagram')} />
          <Field label="Facebook" value={form.facebook} onChange={set('facebook')} />
          <Field label="YouTube" value={form.youTube} onChange={set('youTube')} />
        </div>
      </Section>

      <Section title={t('companyInfo.sections.oferta')} className="lg:col-span-2">
        <p className="text-[12px] text-muted-foreground -mt-2">{t('companyInfo.ofertaHint')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LANGS.map(lang => {
            const existing = ofertaUrls[lang];
            const picked = ofertaFiles[lang];
            return (
              <div key={lang} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-foreground">{LANG_LABELS[lang]}</span>
                  {existing && !picked && (
                    <a href={getFileUrl(existing)} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] text-accent hover:underline">
                      <FileText size={13} /> {t('companyInfo.viewPdf')}
                    </a>
                  )}
                </div>
                <label className="mt-2 flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-card text-[13px] font-medium cursor-pointer hover:bg-muted/40 transition-colors">
                  <Upload size={14} />
                  <span className="truncate">{picked ? picked.name : t('companyInfo.uploadPdf')}</span>
                  <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => handleOferta(lang, e.target.files?.[0])} />
                </label>
              </div>
            );
          })}
        </div>
      </Section>
      </div>

      <div className="flex justify-end max-w-6xl">
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="h-11 px-8 bg-accent text-accent-foreground rounded-lg font-semibold text-[15px] tracking-[-0.014em] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </div>
  );
};

export default CompanyInfoPage;
