import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { PageMeta } from '@/lib/seo';
import { useCartStore } from '@/shared/store/cartStore';
import { paymentService } from '@/features/payment';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

type View = 'checking' | 'paid' | 'failed';

const MAX_ATTEMPTS = 6;
const RETRY_DELAY_MS = 2000;

const PaymentSuccessPage = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const orderNumber = params.get('order') ?? '';
  const { clearCart } = useCartStore();
  const [view, setView] = useState<View>('checking');
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!orderNumber) {
      setView('failed');
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const check = async () => {
      try {
        const status = await paymentService.getStatus(orderNumber);
        if (cancelled) return;

        if (status.paymentStatus === 'Paid') {
          if (!clearedRef.current) {
            clearCart();
            clearedRef.current = true;
          }
          setView('paid');
          return;
        }

        if (status.paymentStatus === 'Failed') {
          setView('failed');
          return;
        }
      } catch {
        // ignore — will retry / fall through to timeout
      }

      attempts += 1;
      if (attempts < MAX_ATTEMPTS && !cancelled) {
        setTimeout(check, RETRY_DELAY_MS);
      } else if (!cancelled) {
        // Webhook may still be in flight — treat as success-pending, send to orders.
        setView('paid');
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [orderNumber, clearCart]);

  return (
    <StorefrontLayout>
      <PageMeta title="Payment — Opto Vestor" pageType="private" />
      <div className="container py-20 text-center animate-fade-in">
        {view === 'checking' && (
          <>
            <Loader2 className="mx-auto mb-6 text-accent animate-spin" size={64} />
            <h1 className="text-[28px] font-bold tracking-[-0.02em] font-display text-foreground mb-2">
              {t('payment.processing')}
            </h1>
            <p className="text-[15px] text-muted-foreground">{t('payment.processingDesc')}</p>
          </>
        )}

        {view === 'paid' && (
          <>
            <CheckCircle className="mx-auto mb-6 text-success" size={80} />
            <h1 className="text-[34px] font-bold tracking-[-0.024em] leading-[1.08] font-display text-foreground mb-2">
              {t('checkoutSuccess.title')}
            </h1>
            <p className="text-[15px] font-normal tracking-[-0.011em] text-muted-foreground mb-6">
              {t('checkoutSuccess.orderNumber')}{' '}
              <strong className="font-semibold tabular-nums text-foreground">{orderNumber}</strong>
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/profile/orders"
                className="h-11 px-8 inline-flex items-center rounded-lg bg-accent text-accent-foreground font-semibold text-[15px] tracking-[-0.014em]"
              >
                {t('checkoutSuccess.goToOrders')}
              </Link>
              <Link
                to="/"
                className="h-11 px-8 inline-flex items-center rounded-lg border border-border text-foreground font-medium text-[15px] tracking-[-0.011em]"
              >
                {t('checkoutSuccess.continueShopping')}
              </Link>
            </div>
          </>
        )}

        {view === 'failed' && (
          <>
            <XCircle className="mx-auto mb-6 text-destructive" size={80} />
            <h1 className="text-[28px] font-bold tracking-[-0.02em] font-display text-foreground mb-2">
              {t('payment.failedTitle')}
            </h1>
            <p className="text-[15px] text-muted-foreground mb-6">{t('payment.failedDesc')}</p>
            <Link
              to="/checkout"
              className="h-11 px-8 inline-flex items-center rounded-lg bg-accent text-accent-foreground font-semibold text-[15px] tracking-[-0.014em]"
            >
              {t('payment.tryAgain')}
            </Link>
          </>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default PaymentSuccessPage;
