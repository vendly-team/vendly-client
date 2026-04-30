import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { CheckCircle } from 'lucide-react';

const CheckoutSuccessPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || 'ORD-2025-000';

  return (
    <StorefrontLayout>
      <div className="container py-20 text-center animate-fade-in">
        <CheckCircle className="mx-auto mb-6 text-success" size={80} />
        <h1 className="text-[34px] font-bold tracking-[-0.024em] leading-[1.08] font-display text-foreground mb-2">{t('checkoutSuccess.title')}</h1>
        <p className="text-[15px] font-normal tracking-[-0.011em] text-muted-foreground mb-6">{t('checkoutSuccess.orderNumber')} <strong className="font-semibold tabular-nums text-foreground">{orderNumber}</strong></p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/profile/orders" className="h-11 px-8 inline-flex items-center rounded-lg bg-accent text-accent-foreground font-semibold text-[15px] tracking-[-0.014em]">{t('checkoutSuccess.goToOrders')}</Link>
          <Link to="/" className="h-11 px-8 inline-flex items-center rounded-lg border border-border text-foreground font-medium text-[15px] tracking-[-0.011em]">{t('checkoutSuccess.continueShopping')}</Link>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default CheckoutSuccessPage;
