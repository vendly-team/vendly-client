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
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';
import RecentlyViewedSection from '@/components/storefront/RecentlyViewedSection';

const CartPage = () => {
  const { t } = useTranslation();
  const { items, removeItem, updateQty, totalAmount } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const totalItems = items.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    if (items.length === 0) return
    const ga4Items: GA4Item[] = items.map(item => ({
      item_id: item.productId,
      item_name: item.name,
      price: item.price,
      quantity: item.qty,
    }))
    trackViewCart(ga4Items, totalAmount)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckout = () => {
    if (!isAuthenticated) { navigate('/login?redirect=/checkout'); return; }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <StorefrontLayout>
        <PageMeta title="Cart — Opto Vestor" pageType="private" />
        <div className="container py-20 text-center animate-fade-in">
          <ShoppingCart className="mx-auto mb-4 text-muted-foreground" size={64} />
          <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground mb-2">{t('cart.empty')}</h1>
          <p className="text-[15px] font-normal tracking-[-0.011em] text-muted-foreground mb-6">{t('cart.emptyHint')}</p>
          <Link to="/" className="inline-flex h-11 px-8 items-center rounded-lg bg-accent text-accent-foreground font-semibold text-[15px] tracking-[-0.014em]">{t('cart.continueShopping')}</Link>
        </div>
        <RecentlyViewedSection />
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <PageMeta title="Cart — Opto Vestor" pageType="private" />
      <div className="container py-6 animate-fade-in">
        <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground mb-6">{t('cart.title', { count: totalItems })}</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 bg-card border border-border rounded-lg p-4">
                <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-20 h-20 rounded-md object-contain bg-muted" />
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.productId}`} className="text-[15px] font-semibold tracking-[-0.011em] text-foreground hover:text-accent line-clamp-1">{item.name}</Link>
                  <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground tabular-nums">SKU: {item.sku}</p>
                  <p className="text-[15px] font-bold tracking-[-0.011em] text-foreground mt-1 tabular-nums">{formatPrice(item.price)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => {
                    const ga4Item: GA4Item = {
                      item_id: item.productId,
                      item_name: item.name,
                      price: item.price,
                      quantity: item.qty,
                    }
                    trackRemoveFromCart(ga4Item, item.price * item.qty)
                    removeItem(item.productId)
                  }} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                  <div className="flex items-center border border-border rounded">
                    <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted"><Minus size={14} /></button>
                    <span className="w-10 text-center text-[14px] font-medium tracking-[-0.011em] tabular-nums">{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, item.qty + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted"><Plus size={14} /></button>
                  </div>
                  <span className="text-[15px] font-semibold tracking-[-0.011em] tabular-nums">{formatPrice(item.price * item.qty)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:w-80">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] font-display text-foreground mb-4">{t('cart.orderSummary')}</h3>
              <div className="space-y-2 text-[14px] font-normal tracking-[-0.006em] mb-4">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('common.subtotal')}</span><span className="font-semibold tracking-[-0.011em] tabular-nums">{formatPrice(totalAmount)}</span></div>
                <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground">{t('cart.deliveryHint')}</p>
              </div>
              <hr className="border-border mb-4" />
              <div className="flex justify-between text-[16px] font-bold tracking-[-0.014em] text-foreground mb-4">
                <span>{t('common.total')}</span><span className="tabular-nums">{formatPrice(totalAmount)}</span>
              </div>
              <button onClick={handleCheckout} className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-[15px] tracking-[-0.014em] hover:bg-accent/90">
                {t('cart.proceedToCheckout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default CartPage;
