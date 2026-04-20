import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { toast } from 'sonner';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    toast.success(t('auth.success.resetSent'));
  };

  return (
    <StorefrontLayout>
      <div className="container py-12 max-w-md mx-auto animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6 text-center">{t('auth.forgotPasswordTitle')}</h1>
        {!sent ? (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">{t('common.email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" />
            </div>
            <button type="submit" className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-sm">{t('auth.sendResetLink')}</button>
            <p className="text-sm text-center"><Link to="/login" className="text-accent hover:underline">{t('auth.backToSignIn')}</Link></p>
          </form>
        ) : (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground mb-4">{t('auth.resetHint')}</p>
            <Link to="/login" className="text-accent hover:underline text-sm">{t('auth.backToSignIn')}</Link>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default ForgotPasswordPage;
