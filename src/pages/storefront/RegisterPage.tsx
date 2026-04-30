import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useAuthStore } from '@/shared/store/authStore';
import { toast } from 'sonner';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '', agree: false });
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName) e.firstName = t('auth.errors.fieldRequired');
    if (!form.lastName) e.lastName = t('auth.errors.fieldRequired');
    if (!form.phone) e.phone = t('auth.errors.fieldRequired');
    if (!form.email || !form.email.includes('@')) e.email = t('auth.errors.validEmail');
    if (form.password.length < 8) e.password = t('auth.errors.minPassword');
    if (form.password !== form.confirmPassword) e.confirmPassword = t('auth.errors.passwordMismatch');
    if (!form.agree) e.agree = t('auth.errors.agreeRequired');
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    const success = await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password });
    setLoading(false);

    if (success) {
      toast.success(t('auth.success.accountCreated'));
      navigate('/');
    } else {
      toast.error(t('auth.errors.invalidInput'));
    }
  };

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div>
      <label className="text-[13px] font-medium tracking-[-0.006em] text-foreground">{label}</label>
      <input type={type} value={form[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em] mt-1" />
      {errors[key] && <p className="text-[12px] font-normal tracking-[-0.003em] text-destructive mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <StorefrontLayout>
      <div className="container py-12 max-w-md mx-auto animate-fade-in">
        <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground mb-6 text-center">{t('auth.createAccount')}</h1>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field(`${t('auth.firstName')} *`, 'firstName')}
            {field(`${t('auth.lastName')} *`, 'lastName')}
          </div>
          {field(`${t('common.phone')} *`, 'phone', 'tel')}
          {field(`${t('common.email')} *`, 'email', 'email')}
          {field(`${t('auth.password')} *`, 'password', 'password')}
          {field(`${t('auth.confirmPassword')} *`, 'confirmPassword', 'password')}
          <label className="flex items-center gap-2 text-[14px] font-normal tracking-[-0.006em]">
            <input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} className="rounded" />
            {t('auth.agreeTerms')}
          </label>
          {errors.agree && <p className="text-[12px] font-normal tracking-[-0.003em] text-destructive">{errors.agree}</p>}
          <button type="submit" disabled={loading} className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-[15px] tracking-[-0.014em] disabled:opacity-50">
            {loading ? t('common.loading', { defaultValue: 'Loading...' }) : t('auth.createAccount')}
          </button>
          <p className="text-[14px] font-normal tracking-[-0.006em] text-center text-muted-foreground">
            {t('auth.hasAccount')} <Link to="/login" className="text-accent hover:underline font-medium">{t('auth.signIn')}</Link>
          </p>
        </form>
      </div>
    </StorefrontLayout>
  );
};

export default RegisterPage;
