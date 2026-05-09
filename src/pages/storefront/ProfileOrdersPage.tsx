import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/shared/store/authStore';
import { useOrderStore } from '@/shared/store/orderStore';
import { orders as mockOrders } from '@/shared/data/orders';
import { formatPrice } from '@/shared/utils';
import { PageMeta } from '@/lib/seo'
import { Package } from 'lucide-react';

const statusColors: Record<string, string> = { new: 'bg-info/10 text-info', accepted: 'bg-purple-100 text-purple-700', in_transit: 'bg-warning/10 text-warning', delivered: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive' };

const ProfileOrdersPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { userOrders } = useOrderStore();
  const allOrders = [...userOrders, ...mockOrders.filter(o => o.customerId === (user?.id || 'c1'))];

  if (allOrders.length === 0) {
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
        {allOrders.map((order) => (
          <Link key={order.id} to={`/profile/orders/${order.id}`} className="block bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[15px] font-semibold tracking-[-0.011em] text-foreground tabular-nums">{order.orderNumber}</span>
              <span className={`text-[11px] font-semibold tracking-[-0.005em] px-2 py-1 rounded ${statusColors[order.status] || ''}`}>{t(`statusLabels.${order.status === 'in_transit' ? 'inTransit' : order.status}`)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px] font-normal tracking-[-0.006em] text-muted-foreground">
              <span className="tabular-nums">{new Date(order.createdAt).toLocaleDateString()}</span>
              <span>{order.items.length} {t('profileOrders.items')}</span>
              <span className="text-[14px] font-semibold tracking-[-0.011em] text-foreground tabular-nums">{formatPrice(order.totalAmount)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProfileOrdersPage;
