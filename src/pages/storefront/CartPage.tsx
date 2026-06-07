import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { PageMeta } from '@/lib/seo'
import { trackViewCart, trackRemoveFromCart } from '@/lib/analytics'
import type { GA4Item } from '@/lib/analytics'
import { useEffect } from 'react'
import { useCartStore } from '@/shared/store/cartStore';
import { useAuthStore } from '@/shared/store/authStore';
import { formatPrice } from '@/shared/utils';
import { useProductPlaceholder } from '@/hooks/useProductPlaceholder';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, Package, Truck } from 'lucide-react';
import RecentlyViewedSection from '@/components/storefront/RecentlyViewedSection';

const CartPage = () => {
  const { t } = useTranslation();
  const placeholder = useProductPlaceholder();
  const { items, removeItem, updateQty } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalAmount = items.reduce((s, i) => s + i.price * i.qty, 0);

  useEffect(() => {
    if (items.length === 0) return;
    const ga4Items: GA4Item[] = items.map(item => ({
      item_id: item.productId,
      item_name: item.name,
      price: item.price,
      quantity: item.qty,
    }));
    trackViewCart(ga4Items, totalAmount);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckout = () => {
    if (!isAuthenticated) { navigate('/login?redirect=/checkout'); return; }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <StorefrontLayout>
        <PageMeta title="Cart — Opto Vestor" pageType="private" />
        <div className="container py-24 flex flex-col items-center text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
            <ShoppingCart className="text-muted-foreground" size={36} />
          </div>
          <h1 className="text-[24px] font-bold tracking-[-0.02em] text-foreground mb-2">{t('cart.empty')}</h1>
          <p className="text-[15px] text-muted-foreground mb-6 max-w-xs">{t('cart.emptyHint')}</p>
          <Link
            to="/"
            className="inline-flex h-11 px-8 items-center gap-2 rounded-xl bg-accent text-accent-foreground font-semibold text-[15px] tracking-[-0.014em] hover:bg-accent/90 transition-colors"
          >
            {t('cart.continueShopping')}
            <ArrowRight size={16} />
          </Link>
        </div>
        <RecentlyViewedSection />
      </StorefrontLayout>
    );
  }

  const totalQty = totalItems;

  return (
    <StorefrontLayout>
      <PageMeta title="Cart — Opto Vestor" pageType="private" />
      <div className="container py-8 animate-fade-in">
        <h1 className="text-[26px] font-bold tracking-[-0.022em] text-foreground mb-6">
          {t('cart.title', { count: items.length })}
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Items list */}
          <div className="flex-1 min-w-0 space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 bg-card border border-border rounded-xl p-4 hover:border-accent/30 transition-colors"
              >
                <Link to={`/product/${item.productId}`} className="shrink-0">
                  <img
                    src={item.image || placeholder}
                    alt={item.name}
                    className="w-24 h-24 rounded-lg object-contain bg-muted"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/product/${item.productId}`}
                      className="text-[15px] font-semibold tracking-[-0.011em] text-foreground hover:text-accent transition-colors line-clamp-2 leading-snug"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => {
                        const ga4Item: GA4Item = {
                          item_id: item.productId,
                          item_name: item.name,
                          price: item.price,
                          quantity: item.qty,
                        };
                        trackRemoveFromCart(ga4Item, item.price * item.qty);
                        void removeItem(item.productId);
                      }}
                      className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => void updateQty(item.productId, item.qty - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-10 text-center text-[14px] font-semibold tracking-[-0.011em] tabular-nums">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => void updateQty(item.productId, item.qty + 1)}
                        disabled={item.stock !== undefined && item.qty >= item.stock}
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[16px] font-bold tracking-[-0.014em] tabular-nums text-foreground">
                        {formatPrice(item.price * item.qty)}
                      </p>
                      {item.qty > 1 && (
                        <p className="text-[12px] text-muted-foreground tabular-nums">
                          {formatPrice(item.price)} × {item.qty}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="bg-card border border-border rounded-xl p-5 sticky top-24 space-y-4">
              <h2 className="text-[16px] font-bold tracking-[-0.014em] text-foreground">
                {t('cart.orderSummary')}
              </h2>

              <div className="space-y-2.5 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Package size={13} />
                    {items.length} {t('cart.kinds', { count: items.length })}
                  </span>
                  <span className="font-medium tabular-nums">{totalQty} {t('cart.pcs')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('common.subtotal')}</span>
                  <span className="font-semibold tabular-nums">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Delivery info block */}
              <div className="flex items-start gap-3 bg-muted/60 rounded-xl px-3.5 py-3">
                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Truck size={15} className="text-accent" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground leading-snug">
                    {t('cart.delivery')}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
                    {t('cart.deliveryHint')}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[15px] font-bold tracking-[-0.011em]">{t('common.total')}</span>
                  <span className="text-[20px] font-black tracking-[-0.02em] tabular-nums text-foreground">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground text-right">
                  + {t('cart.deliveryNotIncluded')}
                </p>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full h-11 bg-accent text-accent-foreground rounded-xl font-semibold text-[15px] tracking-[-0.014em] hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
              >
                {t('cart.proceedToCheckout')}
                <ArrowRight size={16} />
              </button>

              <Link
                to="/"
                className="block text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <RecentlyViewedSection />
    </StorefrontLayout>
  );
};

export default CartPage;
