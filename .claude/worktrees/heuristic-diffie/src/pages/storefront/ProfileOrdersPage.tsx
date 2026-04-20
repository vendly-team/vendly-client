import { Link } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import { useOrderStore } from '@/shared/store/orderStore';
import { orders as mockOrders } from '@/shared/data/orders';
import { formatPrice } from '@/shared/utils';
import { Package } from 'lucide-react';

const statusColors: Record<string, string> = { new: 'bg-info/10 text-info', accepted: 'bg-purple-100 text-purple-700', in_transit: 'bg-warning/10 text-warning', delivered: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive' };
const statusLabels: Record<string, string> = { new: 'New', accepted: 'Accepted', in_transit: 'In Transit', delivered: 'Delivered', cancelled: 'Cancelled' };

const ProfileOrdersPage = () => {
  const { user } = useAuthStore();
  const { userOrders } = useOrderStore();
  const allOrders = [...userOrders, ...mockOrders.filter(o => o.customerId === (user?.id || 'c1'))];

  if (allOrders.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="mx-auto mb-4 text-muted-foreground" size={48} />
        <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
        <Link to="/" className="text-accent hover:underline">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">My Orders</h1>
      <div className="space-y-4">
        {allOrders.map((order) => (
          <Link key={order.id} to={`/profile/orders/${order.id}`} className="block bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-foreground">{order.orderNumber}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[order.status] || ''}`}>{statusLabels[order.status]}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              <span className="font-medium text-foreground">{formatPrice(order.totalAmount)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProfileOrdersPage;
