import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { PageMeta } from '@/lib/seo'
import { trackPurchase } from '@/lib/analytics'
import type { GA4Item, PurchaseData } from '@/lib/analytics'
import { useOrderStore } from '@/shared/store/orderStore';
import { CheckCircle } from 'lucide-react';

const CONFIRMED_STATUSES = new Set(['new', 'accepted', 'in_transit', 'delivered'])
const DEDUP_PREFIX = 'ga4_purchase_'

const CheckoutSuccessPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || 'ORD-2025-000';
  const { userOrders } = useOrderStore();

  useEffect(() => {
    const dedupKey = `${DEDUP_PREFIX}${orderNumber}`
    if (sessionStorage.getItem(dedupKey)) return

    const order = userOrders.find(o => o.orderNumber === orderNumber)
    if (!order) return
    if (!CONFIRMED_STATUSES.has(order.status)) return

    const ga4Items: GA4Item[] = order.items.map(item => ({
      item_id: item.productId,
      item_name: item.productName,
      price: item.priceSnapshot,
      quantity: item.qty,
    }))

    const purchaseData: PurchaseData = {
      transaction_id: order.id,
      value: order.totalAmount,
      shipping: order.deliveryCost,
      items: ga4Items,
    }

    trackPurchase(purchaseData)
    sessionStorage.setItem(dedupKey, '1')
  }, [orderNumber, userOrders])

  return (
    <StorefrontLayout>
      <PageMeta title="Order Confirmed — Opto Vestor" pageType="private" />
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
