import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/shared/utils';
import { PageMeta } from '@/lib/seo';
import { Package, Loader2, MapPin, Truck } from 'lucide-react';
import { useMyOrders, ORDER_STATUS_COLORS, orderStatusKey } from '@/features/orders';
import { useProductPlaceholder } from '@/hooks/useProductPlaceholder';

const ProfileOrdersPage = () => {
  const { t } = useTranslation();
  const placeholder = useProductPlaceholder();
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
      <PageMeta title="My Orders — Optoweek" pageType="private" />
      <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground mb-6">{t('profileOrders.title')}</h1>
      <div className="space-y-4">
        {orders.map((order) => {
          const isActive = order.status === 'Draft' || order.status === 'New';
          const items = order.items ?? [];
          const previewImages = items.slice(0, 4);
          const remaining = order.itemCount - previewImages.length;
          return (
            <Link
              key={order.id}
              to={isActive ? `/checkout?step=2&orderId=${order.id}` : `/profile/orders/${order.id}`}
              className="block bg-card border border-border rounded-xl p-4 hover:border-accent/40 hover:shadow-sm transition-all"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-[15px] font-semibold tracking-[-0.011em] text-foreground tabular-nums">{order.orderNumber}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5 tabular-nums">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`shrink-0 text-[11px] font-semibold tracking-[-0.005em] px-2.5 py-1 rounded-lg ${ORDER_STATUS_COLORS[order.status] || ''}`}>
                  {t(orderStatusKey(order.status))}
                </span>
              </div>

              {/* Product images */}
              {previewImages.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  {previewImages.map((item) => (
                    <div key={item.id} className="w-14 h-14 rounded-lg border border-border bg-muted shrink-0 overflow-hidden">
                      <img
                        src={item.image || placeholder}
                        alt={item.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                  {remaining > 0 && (
                    <div className="w-14 h-14 rounded-lg border border-border bg-muted shrink-0 flex items-center justify-center">
                      <span className="text-[12px] font-semibold text-muted-foreground">+{remaining}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Item names */}
              <div className="mb-3 space-y-0.5">
                {items.slice(0, 2).map((item) => (
                  <p key={item.id} className="text-[13px] text-foreground tracking-[-0.006em] truncate">
                    {item.productName}
                    <span className="text-muted-foreground"> × {item.qty}</span>
                  </p>
                ))}
                {order.itemCount > 2 && (
                  <p className="text-[12px] text-muted-foreground">
                    +{order.itemCount - 2} {t('profileOrders.items')}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-border my-3" />

              {/* Price breakdown + delivery city */}
              <div className="flex items-end justify-between gap-4">
                <div className="space-y-1 text-[13px]">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin size={12} />
                    <span>{order.deliveryCity}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Truck size={12} />
                    <span>{t('common.delivery')}: {formatPrice(order.deliveryCost)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-muted-foreground tabular-nums">{t('common.subtotal')}: {formatPrice(order.subtotal)}</p>
                  <p className="text-[17px] font-bold tracking-[-0.016em] text-foreground tabular-nums">{formatPrice(order.totalAmount)}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileOrdersPage;
