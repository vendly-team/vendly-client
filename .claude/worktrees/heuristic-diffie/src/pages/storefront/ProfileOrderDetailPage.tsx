import { useParams, Link } from 'react-router-dom';
import { useOrderStore } from '@/shared/store/orderStore';
import { orders as mockOrders } from '@/shared/data/orders';
import { formatPrice } from '@/shared/utils';
import type { OrderStatus } from '@/shared/data/orders';

const steps: OrderStatus[] = ['new', 'accepted', 'in_transit', 'delivered'];
const stepLabels: Record<string, string> = { new: 'New', accepted: 'Accepted', in_transit: 'In Transit', delivered: 'Delivered' };
const statusColors: Record<string, string> = { new: 'bg-info/10 text-info', accepted: 'bg-purple-100 text-purple-700', in_transit: 'bg-warning/10 text-warning', delivered: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive' };

const ProfileOrderDetailPage = () => {
  const { id } = useParams();
  const { userOrders } = useOrderStore();
  const order = [...userOrders, ...mockOrders].find((o) => o.id === id);

  if (!order) return <div className="py-20 text-center"><h2 className="text-xl font-bold">Order not found</h2><Link to="/profile/orders" className="text-accent">Back to Orders</Link></div>;

  const currentStepIndex = order.status === 'cancelled' ? -1 : steps.indexOf(order.status);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">{order.orderNumber}</h1>
        <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[order.status] || ''}`}>{stepLabels[order.status] || 'Cancelled'}</span>
      </div>

      {/* Status timeline */}
      {order.status !== 'cancelled' ? (
        <div className="flex items-center gap-2 mb-8 overflow-x-auto">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i <= currentStepIndex ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
              <span className={`text-sm whitespace-nowrap ${i <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{stepLabels[s]}</span>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < currentStepIndex ? 'bg-accent' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">Order was cancelled</div>
      )}

      {/* Items */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-3">Items</h3>
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <img src={item.productImage || '/placeholder.svg'} alt="" className="w-12 h-12 rounded bg-muted object-cover" />
            <div className="flex-1"><p className="text-sm font-medium">{item.productName}</p><p className="text-xs text-muted-foreground">SKU: {item.sku} × {item.qty}</p></div>
            <span className="text-sm font-medium">{formatPrice(item.priceSnapshot * item.qty)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Delivery</h3>
          <p className="text-sm text-muted-foreground">{order.deliveryAddress.city}, {order.deliveryAddress.district}</p>
          <p className="text-sm text-muted-foreground">{order.deliveryAddress.street}</p>
          <p className="text-sm text-muted-foreground mt-2">Est. Delivery: {order.estimatedDelivery}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Payment</h3>
          <p className="text-sm text-muted-foreground">Method: {order.paymentProvider || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">Status: {order.paymentStatus}</p>
          <hr className="my-2 border-border" />
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(order.totalAmount - order.deliveryCost)}</span></div>
          <div className="flex justify-between text-sm"><span>Delivery</span><span>{formatPrice(order.deliveryCost)}</span></div>
          <div className="flex justify-between font-bold mt-1"><span>Total</span><span>{formatPrice(order.totalAmount)}</span></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOrderDetailPage;
