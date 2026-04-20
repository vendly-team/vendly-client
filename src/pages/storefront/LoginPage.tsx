import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useAuthStore } from '@/shared/store/authStore';
import { toast } from 'sonner';

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 8) { toast.error(t('auth.errors.invalidInput')); return; }
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) { toast.success(t('auth.success.welcome')); navigate(redirect); }
    else toast.error(t('auth.errors.invalidCredentials'));
  };

  return (
    <StorefrontLayout>
      <div className="container py-12 max-w-md mx-auto animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6 text-center">{t('auth.signIn')}</h1>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">{t('common.email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">{t('auth.password')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" /> {t('auth.rememberMe')}</label>
            <Link to="/forgot-password" className="text-sm text-accent hover:underline">{t('auth.forgotPassword')}</Link>
          </div>
          <button type="submit" disabled={loading} className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-sm disabled:opacity-50">
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </button>
          <p className="text-sm text-center text-muted-foreground">
            {t('auth.noAccount')} <Link to="/register" className="text-accent hover:underline">{t('auth.register')}</Link>
          </p>
          <div className="text-xs text-muted-foreground text-center border-t border-border pt-3">
            {t('auth.demo')}
          </div>
        </form>
      </div>
    </StorefrontLayout>
  );
};

export default LoginPage;
