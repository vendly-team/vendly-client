import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { toast } from 'sonner';
import { PageMeta } from '@/lib/seo'

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
      <PageMeta title="Forgot Password — Opto Vestor" pageType="private" />
      <div className="container py-12 max-w-md mx-auto animate-fade-in">
        <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground mb-6 text-center">{t('auth.forgotPasswordTitle')}</h1>
        {!sent ? (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div>
              <label className="text-[13px] font-medium tracking-[-0.006em] text-foreground">{t('common.email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-10 px-3 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em] mt-1" />
            </div>
            <button type="submit" className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-[15px] tracking-[-0.014em]">{t('auth.sendResetLink')}</button>
            <p className="text-[14px] font-normal tracking-[-0.006em] text-center"><Link to="/login" className="text-accent hover:underline font-medium">{t('auth.backToSignIn')}</Link></p>
          </form>
        ) : (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-[15px] font-normal tracking-[-0.011em] leading-[1.5] text-muted-foreground mb-4">{t('auth.resetHint')}</p>
            <Link to="/login" className="text-accent hover:underline text-[14px] font-medium tracking-[-0.011em]">{t('auth.backToSignIn')}</Link>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default ForgotPasswordPage;
