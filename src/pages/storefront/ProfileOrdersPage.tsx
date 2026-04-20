import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/shared/store/authStore';
import { useOrderStore } from '@/shared/store/orderStore';
import { orders as mockOrders } from '@/shared/data/orders';
import { formatPrice } from '@/shared/utils';
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
        <h3 className="text-lg font-semibold mb-2">{t('profileOrders.noOrders')}</h3>
        <Link to="/" className="text-accent hover:underline">{t('profileOrders.startShopping')}</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">{t('profileOrders.title')}</h1>
      <div className="space-y-4">
        {allOrders.map((order) => (
          <Link key={order.id} to={`/profile/orders/${order.id}`} className="block bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-foreground">{order.orderNumber}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[order.status] || ''}`}>{t(`statusLabels.${order.status === 'in_transit' ? 'inTransit' : order.status}`)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              <span>{order.items.length} {t('profileOrders.items')}</span>
              <span className="font-medium text-foreground">{formatPrice(order.totalAmount)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProfileOrdersPage;
