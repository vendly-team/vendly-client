import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/shared/utils';
import { useProductPlaceholder } from '@/hooks/useProductPlaceholder';
import { PageMeta } from '@/lib/seo';
import { Loader2 } from 'lucide-react';
import { useMyOrder, ORDER_TIMELINE, ORDER_STATUS_COLORS, orderStatusKey } from '@/features/orders';

const OFF_TIMELINE = new Set(['Cancelled', 'ReturnRequested', 'Returned']);

const ProfileOrderDetailPage = () => {
  const { t } = useTranslation();
  const placeholder = useProductPlaceholder();
  const { id } = useParams();
  const { order, loading, error } = useMyOrder(id ? Number(id) : undefined);

  if (loading) {
    return <div className="py-20 text-center"><Loader2 className="mx-auto text-accent animate-spin" size={40} /></div>;
  }

  if (error || !order) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-[24px] font-bold tracking-[-0.018em] leading-[1.15] font-display">{t('orders.notFound')}</h2>
        <Link to="/profile/orders" className="text-[14px] font-medium tracking-[-0.011em] text-accent">{t('profileOrders.backToOrders')}</Link>
      </div>
    );
  }

  const offTimeline = OFF_TIMELINE.has(order.status);
  const currentStepIndex = offTimeline ? -1 : ORDER_TIMELINE.indexOf(order.status);

  return (
    <div>
      <PageMeta title="Order Detail — Opto Vestor" pageType="private" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground tabular-nums">{order.orderNumber}</h1>
        <span className={`text-[11px] font-semibold tracking-[-0.005em] px-2 py-1 rounded ${ORDER_STATUS_COLORS[order.status] || ''}`}>{t(orderStatusKey(order.status))}</span>
      </div>

      {/* Status timeline */}
      {!offTimeline ? (
        <div className="flex items-center gap-2 mb-8 overflow-x-auto">
          {ORDER_TIMELINE.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold tracking-[-0.005em] tabular-nums shrink-0 ${i <= currentStepIndex ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
              <span className={`text-[14px] tracking-[-0.011em] whitespace-nowrap ${i <= currentStepIndex ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{t(orderStatusKey(s))}</span>
              {i < ORDER_TIMELINE.length - 1 && <div className={`w-8 h-0.5 ${i < currentStepIndex ? 'bg-accent' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6 text-[14px] font-medium tracking-[-0.006em]">{t(orderStatusKey(order.status))}</div>
      )}

      {/* Items */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-3">{t('orders.items')}</h3>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <img src={item.image || placeholder} alt="" className="w-12 h-12 rounded bg-muted object-contain" />
            <div className="flex-1"><p className="text-[14px] font-semibold tracking-[-0.011em]">{item.productName}</p><p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground tabular-nums">SKU: {item.sku} × {item.qty}</p></div>
            <span className="text-[14px] font-semibold tracking-[-0.011em] tabular-nums">{formatPrice(item.total)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-2">{t('common.delivery')}</h3>
          <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{order.delivery.city}, {order.delivery.district}</p>
          <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{order.delivery.street}, {order.delivery.house}</p>
          {order.delivery.btsTrackingUrl && (
            <a href={order.delivery.btsTrackingUrl} target="_blank" rel="noreferrer" className="inline-block mt-2 text-[14px] font-medium tracking-[-0.006em] text-accent hover:underline">{t('orders.trackPackage')}</a>
          )}
          {order.delivery.deliveredAt && (
            <p className="text-[13px] font-normal tracking-[-0.006em] text-success mt-2 tabular-nums">{t('orderStatus.Delivered')}: {new Date(order.delivery.deliveredAt).toLocaleDateString()}</p>
          )}
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-2">{t('common.payment')}</h3>
          <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{t('profileOrders.method')} {order.payment?.provider || 'N/A'}</p>
          <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{t('common.status')}: {t(`statusLabels.${(order.paymentStatus || '').toLowerCase()}`)}</p>
          <hr className="my-2 border-border" />
          <div className="flex justify-between text-[14px] font-normal tracking-[-0.006em]"><span>{t('common.subtotal')}</span><span className="tabular-nums">{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between text-[14px] font-normal tracking-[-0.006em]"><span>{t('common.delivery')}</span><span className="tabular-nums">{formatPrice(order.deliveryCost)}</span></div>
          <div className="flex justify-between text-[15px] font-bold tracking-[-0.011em] mt-1"><span>{t('common.total')}</span><span className="tabular-nums">{formatPrice(order.totalAmount)}</span></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOrderDetailPage;
