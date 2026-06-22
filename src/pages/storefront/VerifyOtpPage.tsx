import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useAuthStore } from '@/shared/store/authStore';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { PageMeta } from '@/lib/seo';
import { trackSignUp } from '@/lib/analytics';

const RESEND_COOLDOWN = 60; // soniya
const OTP_EXPIRY_MINUTES = 5; // 5 minut

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const VerifyOtpPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN); // register endi yangi kod yubordi
  const [otpExpiry, setOtpExpiry] = useState(OTP_EXPIRY_MINUTES * 60); // 5 minut = 300 soniya

  const phone = (location.state as { phone?: string } | null)?.phone ?? '';

  // Resend cooldown — har soniyada kamayadi.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // OTP expiry countdown — 5 minut
  useEffect(() => {
    if (otpExpiry <= 0) {
      toast.error(t('auth.otp.expired'));
      navigate('/register');
      return;
    }
    const timer = setTimeout(() => setOtpExpiry((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpExpiry, navigate, t]);

  // Telefon bo'lmasa (sahifaga to'g'ridan kirilgan) — register'ga qaytaramiz.
  if (!phone) return <Navigate to="/register" replace />;

  const doVerify = async (value: string) => {
    if (value.length !== 6 || loading) return;
    setLoading(true);
    const ok = await verifyOtp(phone, value);
    setLoading(false);

    if (ok) {
      trackSignUp('email');
      toast.success(t('auth.success.accountCreated'));
      navigate('/');
    } else {
      toast.error(t('auth.otp.invalid'));
      setCode('');
    }
  };

  const handleChange = (value: string) => {
    setCode(value);
    // Kod to'liq kiritilganda avtomatik tasdiqlaymiz.
    if (value.length === 6) void doVerify(value);
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    const ok = await resendOtp(phone);
    setResending(false);
    if (ok) {
      setCooldown(RESEND_COOLDOWN);
      toast.success(t('auth.otp.resent'));
    } else {
      toast.error(t('auth.otp.resendFailed'));
    }
  };

  return (
    <StorefrontLayout>
      <PageMeta title="Verify OTP — Optoweek" pageType="private" />
      <div className="container py-12 max-w-md mx-auto animate-fade-in">
        <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground mb-2 text-center">
          {t('auth.otp.title')}
        </h1>
        <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground mb-2 text-center">
          {t('auth.otp.description', { phone })}
        </p>
        <p className="text-[13px] font-normal tracking-[-0.006em] text-destructive mb-6 text-center">
          {t('common.expires')} {formatTime(otpExpiry)}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void doVerify(code);
          }}
          className="bg-card border border-border rounded-lg p-6 space-y-5"
        >
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={handleChange} disabled={loading} autoFocus>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-[15px] tracking-[-0.014em] disabled:opacity-50"
          >
            {loading ? t('common.loading', { defaultValue: 'Loading...' }) : t('auth.otp.verify')}
          </button>

          <div className="flex items-center justify-between text-[14px] font-normal tracking-[-0.006em]">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="text-accent hover:underline font-medium disabled:opacity-50 disabled:no-underline disabled:text-muted-foreground"
            >
              {cooldown > 0 ? `${t('auth.otp.resend')} (${cooldown}s)` : t('auth.otp.resend')}
            </button>
            <Link to="/register" className="text-muted-foreground hover:underline">
              {t('auth.otp.changeNumber')}
            </Link>
          </div>
        </form>
      </div>
    </StorefrontLayout>
  );
};

export default VerifyOtpPage;
