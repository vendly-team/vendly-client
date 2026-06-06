import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/shared/utils';
import { PageMeta } from '@/lib/seo';
import { Package, Loader2 } from 'lucide-react';
import { useMyOrders, ORDER_STATUS_COLORS, orderStatusKey } from '@/features/orders';

const ProfileOrdersPage = () => {
  const { t } = useTranslation();
  const { orders, loading, error } = useMyOrders();

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="mx-auto mb-4 text-accent animate-spin" size={40} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-[14px] text-destructive">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="mx-auto mb-4 text-muted-foreground" size={48} />
        <h3 className="text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-2">{t('profileOrders.noOrders')}</h3>
        <Link to="/" className="text-[14px] font-medium tracking-[-0.011em] text-accent hover:underline">{t('profileOrders.startShopping')}</Link>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="My Orders — Opto Vestor" pageType="private" />
      <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground mb-6">{t('profileOrders.title')}</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} to={`/profile/orders/${order.id}`} className="block bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[15px] font-semibold tracking-[-0.011em] text-foreground tabular-nums">{order.orderNumber}</span>
              <span className={`text-[11px] font-semibold tracking-[-0.005em] px-2 py-1 rounded ${ORDER_STATUS_COLORS[order.status] || ''}`}>{t(orderStatusKey(order.status))}</span>
            </div>
            <div className="flex items-center justify-between text-[13px] font-normal tracking-[-0.006em] text-muted-foreground">
              <span className="tabular-nums">{new Date(order.createdAt).toLocaleDateString()}</span>
              <span>{order.itemCount} {t('profileOrders.items')}</span>
              <span className="text-[14px] font-semibold tracking-[-0.011em] text-foreground tabular-nums">{formatPrice(order.totalAmount)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProfileOrdersPage;
