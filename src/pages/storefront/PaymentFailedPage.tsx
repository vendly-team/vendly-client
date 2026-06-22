import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { PageMeta } from '@/lib/seo';
import { XCircle } from 'lucide-react';

const PaymentFailedPage = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const orderNumber = params.get('order') ?? '';

  return (
    <StorefrontLayout>
      <PageMeta title="Payment Failed — Opto Vestor" pageType="private" />
      <div className="container py-20 text-center animate-fade-in">
        <XCircle className="mx-auto mb-6 text-destructive" size={80} />
        <h1 className="text-[34px] font-bold tracking-[-0.024em] leading-[1.08] font-display text-foreground mb-2">
          {t('payment.failedTitle')}
        </h1>
        <p className="text-[15px] font-normal tracking-[-0.011em] text-muted-foreground mb-6">
          {t('payment.failedDesc')}
          {orderNumber && (
            <>
              {' '}
              <strong className="font-semibold tabular-nums text-foreground">{orderNumber}</strong>
            </>
          )}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/checkout"
            className="h-11 px-8 inline-flex items-center rounded-lg bg-accent text-accent-foreground font-semibold text-[15px] tracking-[-0.014em]"
          >
            {t('payment.tryAgain')}
          </Link>
          <Link
            to="/cart"
            className="h-11 px-8 inline-flex items-center rounded-lg border border-border text-foreground font-medium text-[15px] tracking-[-0.011em]"
          >
            {t('payment.backToCart')}
          </Link>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default PaymentFailedPage;
