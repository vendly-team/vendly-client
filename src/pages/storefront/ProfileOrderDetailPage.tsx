import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrderStore } from '@/shared/store/orderStore';
import { orders as mockOrders } from '@/shared/data/orders';
import { formatPrice } from '@/shared/utils';
import type { OrderStatus } from '@/shared/data/orders';

const steps: OrderStatus[] = ['new', 'accepted', 'in_transit', 'delivered'];
const stepLabelKeys: Record<string, string> = { new: 'statusLabels.new', accepted: 'statusLabels.accepted', in_transit: 'statusLabels.inTransit', delivered: 'statusLabels.delivered' };
const statusColors: Record<string, string> = { new: 'bg-info/10 text-info', accepted: 'bg-purple-100 text-purple-700', in_transit: 'bg-warning/10 text-warning', delivered: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive' };

const ProfileOrderDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { userOrders } = useOrderStore();
  const order = [...userOrders, ...mockOrders].find((o) => o.id === id);

  if (!order) return <div className="py-20 text-center"><h2 className="text-[24px] font-bold tracking-[-0.018em] leading-[1.15] font-display">{t('orders.notFound')}</h2><Link to="/profile/orders" className="text-[14px] font-medium tracking-[-0.011em] text-accent">{t('profileOrders.backToOrders')}</Link></div>;

  const currentStepIndex = order.status === 'cancelled' ? -1 : steps.indexOf(order.status);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground tabular-nums">{order.orderNumber}</h1>
        <span className={`text-[11px] font-semibold tracking-[-0.005em] px-2 py-1 rounded ${statusColors[order.status] || ''}`}>{t(stepLabelKeys[order.status] || 'statusLabels.cancelled')}</span>
      </div>

      {/* Status timeline */}
      {order.status !== 'cancelled' ? (
        <div className="flex items-center gap-2 mb-8 overflow-x-auto">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold tracking-[-0.005em] tabular-nums shrink-0 ${i <= currentStepIndex ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
              <span className={`text-[14px] tracking-[-0.011em] whitespace-nowrap ${i <= currentStepIndex ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{t(stepLabelKeys[s])}</span>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < currentStepIndex ? 'bg-accent' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6 text-[14px] font-medium tracking-[-0.006em]">{t('orders.wasCancelled')}</div>
      )}

      {/* Items */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-3">{t('orders.items')}</h3>
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <img src={item.productImage || '/placeholder.svg'} alt="" className="w-12 h-12 rounded bg-muted object-contain" />
            <div className="flex-1"><p className="text-[14px] font-semibold tracking-[-0.011em]">{item.productName}</p><p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground tabular-nums">SKU: {item.sku} × {item.qty}</p></div>
            <span className="text-[14px] font-semibold tracking-[-0.011em] tabular-nums">{formatPrice(item.priceSnapshot * item.qty)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-2">{t('common.delivery')}</h3>
          <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{order.deliveryAddress.city}, {order.deliveryAddress.district}</p>
          <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{order.deliveryAddress.street}</p>
          <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground mt-2">{t('profileOrders.estDelivery')} <span className="tabular-nums">{order.estimatedDelivery}</span></p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-2">{t('common.payment')}</h3>
          <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{t('profileOrders.method')} {order.paymentProvider || 'N/A'}</p>
          <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{t('common.status')}: {order.paymentStatus}</p>
          <hr className="my-2 border-border" />
          <div className="flex justify-between text-[14px] font-normal tracking-[-0.006em]"><span>{t('common.subtotal')}</span><span className="tabular-nums">{formatPrice(order.totalAmount - order.deliveryCost)}</span></div>
          <div className="flex justify-between text-[14px] font-normal tracking-[-0.006em]"><span>{t('common.delivery')}</span><span className="tabular-nums">{formatPrice(order.deliveryCost)}</span></div>
          <div className="flex justify-between text-[15px] font-bold tracking-[-0.011em] mt-1"><span>{t('common.total')}</span><span className="tabular-nums">{formatPrice(order.totalAmount)}</span></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOrderDetailPage;
