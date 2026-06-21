import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useAuthStore } from '@/shared/store/authStore';
import { PageMeta } from '@/lib/seo'
import { trackLogin } from '@/lib/analytics'
import { toast } from 'sonner';

const formatUzbekPhone = (value: string) => {
  const cleaned = value.replace(/\+/g, '').replace(/\D/g, '');
  if (!cleaned) return '';
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
  if (cleaned.length <= 7) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 7)}-${cleaned.slice(7, 9)}`;
};

const getPhoneDigits = (formatted: string) => {
  const digits = formatted.replace(/\D/g, '');
  return `998${digits}`;
};

const isPhoneInput = (value: string): boolean => {
  if (!value) return false;
  const firstChar = value[0];
  return firstChar === '+' || /\d/.test(firstChar);
};

const cleanLoginValue = (value: string): string => {
  if (!value) return '';
  const firstChar = value[0];
  if (firstChar === '+') {
    return value.slice(1);
  }
  return value;
};

const LoginPage = () => {
  const { t } = useTranslation();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const isPhone = isPhoneInput(loginValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginValue || password.length < 4) { toast.error(t('auth.errors.invalidInput')); return; }
    setLoading(true);
    const loginData = isPhone ? getPhoneDigits(loginValue) : loginValue;
    const result = await login(loginData, password);
    setLoading(false);

    if (!result.success) {
      toast.error(t('auth.errors.invalidCredentials'));
      return;
    }

    if (result.otpRequired && result.phone) {
      toast.success(t('auth.otp.sent'));
      navigate('/verify-otp', { state: { phone: result.phone } });
      return;
    }

    trackLogin('email_phone');
    toast.success(t('auth.success.welcome'));
    navigate(redirect);
  };

  return (
    <StorefrontLayout>
      <PageMeta title="Sign In — Opto Vestor" pageType="private" />
      <div className="container py-12 max-w-md mx-auto animate-fade-in">
        <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground mb-6 text-center">{t('auth.signIn')}</h1>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <label className="text-[13px] font-medium tracking-[-0.006em] text-foreground">{t('common.email')} / {t('common.phone')}</label>
            {isPhone ? (
              <div className="flex items-center gap-0 mt-1">
                <div className="flex items-center px-3 h-10 bg-muted rounded-l-md border border-r-0 border-input">
                  <span className="text-lg">🇺🇿</span>
                  <span className="ml-2 text-[15px] font-normal text-foreground">+998</span>
                </div>
                <input
                  ref={inputRef}
                  type="tel"
                  value={loginValue}
                  onChange={(e) => {
                    let value = e.target.value;
                    value = formatUzbekPhone(value);
                    setLoginValue(value);
                  }}
                  autoFocus
                  placeholder="(XX) XXX-XX-XX"
                  maxLength={17}
                  required
                  className="w-full h-10 px-3 glass-input rounded-r-md text-[15px] font-normal tracking-[-0.011em] border-l-0"
                />
              </div>
            ) : (
              <input
                ref={inputRef}
                type="email"
                value={loginValue}
                onChange={(e) => {
                  let value = e.target.value;
                  if (isPhoneInput(value)) {
                    value = cleanLoginValue(value);
                  }
                  setLoginValue(value);
                }}
                autoFocus
                placeholder="example@email.com"
                required
                className="w-full h-10 px-3 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em] mt-1"
              />
            )}
          </div>
          <div>
            <label className="text-[13px] font-medium tracking-[-0.006em] text-foreground">{t('auth.password')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} className="w-full h-10 px-3 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em] mt-1" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[14px] font-normal tracking-[-0.006em]"><input type="checkbox" className="rounded" /> {t('auth.rememberMe')}</label>
            <Link to="/forgot-password" className="text-[14px] font-medium tracking-[-0.011em] text-accent hover:underline">{t('auth.forgotPassword')}</Link>
          </div>
          <button type="submit" disabled={loading} className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-[15px] tracking-[-0.014em] disabled:opacity-50">
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </button>
          <p className="text-[14px] font-normal tracking-[-0.006em] text-center text-muted-foreground">
            {t('auth.noAccount')} <Link to="/register" className="text-accent hover:underline font-medium">{t('auth.register')}</Link>
          </p>
          <div className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground text-center border-t border-border pt-3">
            {t('auth.demo')}
          </div>
        </form>
      </div>
    </StorefrontLayout>
  );
};

export default LoginPage;
