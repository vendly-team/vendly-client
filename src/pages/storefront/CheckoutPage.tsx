import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { PageMeta } from '@/lib/seo'
import { trackBeginCheckout, trackAddPaymentInfo } from '@/lib/analytics'
import type { GA4Item } from '@/lib/analytics'
import { useEffect } from 'react'
import { useCartStore } from '@/shared/store/cartStore';
import { useCheckoutSelectionStore } from '@/shared/store/checkoutSelectionStore';
import { useAddresses } from '@/features/addresses';
import { AddressSelector, useShippingQuote } from '@/features/checkout';
import { usePayment } from '@/features/payment';
import { orderService, useMyOrder } from '@/features/orders';
import { formatPrice } from '@/shared/utils';
import { useProductPlaceholder } from '@/hooks/useProductPlaceholder';
import { ApiError } from '@/shared/api/http';

// CheckoutPage radio qiymatini backend PaymentProvider enum'iga maplaydi.
const PROVIDER_BY_METHOD = {
  card: 'Hamkor',
  click: 'Click',
  payme: 'Payme',
} as const;

const CheckoutPage = () => {
  const { t } = useTranslation();
  const placeholder = useProductPlaceholder();
  const { items, loaded: cartLoaded } = useCartStore();
  const { addresses } = useAddresses();
  const { selectedAddressId, draftOrderId, setDraftOrderId } = useCheckoutSelectionStore();
  const { loading: paying, startPayment } = usePayment();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const step = Math.min(3, Math.max(1, parseInt(searchParams.get('step') ?? '1', 10)));
  const urlOrderId = parseInt(searchParams.get('orderId') ?? '0', 10) || null;
  const effectiveOrderId = draftOrderId ?? urlOrderId;
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'click' | 'payme' | 'card'>('card');

  // Fetch order detail when we have an effectiveOrderId (resume flow or refresh).
  const { order: fetchedOrder, loading: orderLoading } = useMyOrder(effectiveOrderId ?? undefined);

  // In summary step, prefer order snapshot data over live cart data.
  const summaryItems = fetchedOrder?.items ?? items.map(i => ({
    id: i.cartItemId,
    productId: undefined,
    productName: i.name,
    sku: i.sku,
    image: i.image,
    qty: i.qty,
    price: i.price,
    total: i.price * i.qty,
  }));
  const subtotal = fetchedOrder?.subtotal ?? items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryCost = fetchedOrder?.deliveryCost ?? 0;
  const grandTotal = fetchedOrder?.totalAmount ?? (subtotal + deliveryCost);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // Live delivery-cost preview on the address step (cart weight computed server-side).
  const {
    quote: liveQuote,
    loading: quoteLoading,
    error: quoteError,
  } = useShippingQuote(step === 1 ? selectedAddressId : null);
  const step1Subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  // Sync URL orderId → store on refresh (store is not persisted).
  useEffect(() => {
    if (!draftOrderId && urlOrderId) setDraftOrderId(urlOrderId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (items.length === 0) return
    const ga4Items: GA4Item[] = items.map(item => ({
      item_id: item.productId,
      item_name: item.name,
      price: item.price,
      quantity: item.qty,
    }))
    trackBeginCheckout(ga4Items, grandTotal)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleContinueToSummary = async () => {
    if (!selectedAddressId) return;
    setCreatingOrder(true);
    try {
      const res = await orderService.createDraft(selectedAddressId);
      setDraftOrderId(res.id);
      setSearchParams({ step: '2', orderId: String(res.id) }, { replace: true });
    } catch (e) {
      // Yetkazib berish narxini hisoblab bo'lmasa — summary qadamiga O'TMAYMIZ.
      const code = e instanceof ApiError ? e.code : null;
      const messageByCode: Record<string, string> = {
        'Shipping.RouteUnavailable': t('checkout.errors.routeUnavailable'),
        'Shipping.WeightMissing': t('checkout.errors.weightMissing'),
        'Shipping.CalculateFailed': t('checkout.errors.deliveryCalcFailed'),
      };
      const message = (code && messageByCode[code])
        ?? (e instanceof Error ? e.message : t('common.error'));
      toast.error(message);
    } finally {
      setCreatingOrder(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!effectiveOrderId) {
      toast.error(t('checkout.errors.selectAddress'));
      setSearchParams({ step: '1' }, { replace: true });
      return;
    }

    const ga4ItemsForCheckout: GA4Item[] = items.map(item => ({
      item_id: item.productId,
      item_name: item.name,
      price: item.price,
      quantity: item.qty,
    }))

    trackAddPaymentInfo(ga4ItemsForCheckout, grandTotal, paymentMethod)
    startPayment(effectiveOrderId, PROVIDER_BY_METHOD[paymentMethod]);
  };

  const steps = [t('checkout.address'), t('checkout.summary'), t('checkout.payment')];

  return (
    <StorefrontLayout>
      <PageMeta title="Checkout — Opto Vestor" pageType="private" />

      {/* Progress bar — mobile only, sticks below the sticky header */}
      <div className="md:hidden sticky top-0 z-[49] w-full">
        <div className="h-[3px] bg-muted">
          <div
            className="h-full bg-accent transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${step === steps.length ? 90 : (step / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="container py-6 animate-fade-in max-w-3xl mx-auto px-4">
        <h1 className="hidden md:block text-[24px] sm:text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground mb-6">
          {t('checkout.title')}
        </h1>

        {/* Step indicator — tablet and above only */}
        <div className="hidden md:flex items-center justify-center gap-2 sm:gap-4 mb-8 flex-wrap">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold tracking-[-0.005em] tabular-nums ${
                  i + 1 <= step ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1 < step ? <Check size={16} /> : i + 1}
              </div>
              <span
                className={`text-[14px] tracking-[-0.011em] ${
                  i + 1 <= step ? 'text-foreground font-semibold' : 'text-muted-foreground'
                }`}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <div className={`hidden sm:block w-8 lg:w-12 h-0.5 ${i + 1 < step ? 'bg-accent' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Address */}
        {step === 1 && (
          <>
            <div className="md:hidden relative flex items-center justify-center mb-4">
              <button
                onClick={() => navigate('/cart')}
                className="absolute left-0 p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft size={26} />
              </button>
              <h2 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] font-display text-center">
                {t('checkout.deliveryAddress')}
              </h2>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <h2 className="hidden md:block text-[18px] sm:text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-4">
                {t('checkout.deliveryAddress')}
              </h2>
              <AddressSelector onContinue={handleContinueToSummary} loading={creatingOrder} />
            </div>

            {/* Live delivery cost preview once an address is selected */}
            {selectedAddressId && (
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mt-4">
                <div className="space-y-2 text-[14px] font-normal tracking-[-0.006em]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('common.subtotal')}</span>
                    <span className="tabular-nums">{formatPrice(step1Subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('common.delivery')}</span>
                    {quoteLoading ? (
                      <Loader2 className="text-accent animate-spin" size={16} />
                    ) : quoteError ? (
                      <span className="text-[13px] text-destructive">{quoteError}</span>
                    ) : liveQuote ? (
                      <span className="tabular-nums">{formatPrice(liveQuote.cost)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between text-[16px] font-bold tracking-[-0.014em] text-foreground">
                    <span>{t('common.total')}</span>
                    <span className="tabular-nums">
                      {liveQuote ? formatPrice(step1Subtotal + liveQuote.cost) : formatPrice(step1Subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 2: Summary */}
        {step === 2 && orderLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="text-accent animate-spin" size={36} />
          </div>
        )}
        {step === 2 && !orderLoading && (
          <>
            <div className="md:hidden relative flex items-center justify-center mb-4">
              <button
                onClick={() => setSearchParams(effectiveOrderId ? { step: '1', orderId: String(effectiveOrderId) } : { step: '1' }, { replace: true })}
                className="absolute left-0 p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft size={26} />
              </button>
              <h2 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] font-display text-center">
                {t('checkout.orderSummary')}
              </h2>
            </div>
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <h2 className="hidden md:block text-[18px] sm:text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-4">
              {t('checkout.orderSummary')}
            </h2>

            <div className="space-y-3 mb-6">
              {summaryItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.image || placeholder}
                    alt=""
                    className="w-12 h-12 rounded bg-muted object-contain"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold tracking-[-0.011em] truncate">{item.productName}</p>
                    <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground tabular-nums">
                      {t('common.qty')}: {item.qty}
                    </p>
                  </div>
                  <span className="text-[14px] font-semibold tracking-[-0.011em] tabular-nums">
                    {formatPrice(item.total)}
                  </span>
                </div>
              ))}
            </div>

            {selectedAddress && (
              <div className="mb-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-muted-foreground mb-2">
                  {t('checkout.deliveryAddress')}
                </p>
                <div className="p-3 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[13px] font-semibold tracking-[-0.006em]">{selectedAddress.label}</span>
                  {selectedAddress.isDefault && (
                    <span className="text-[10px] font-semibold tracking-[-0.005em] uppercase bg-success/10 text-success px-1.5 py-0.5 rounded">
                      {t('common.default')}
                    </span>
                  )}
                </div>
                <p className="text-[13px] font-normal tracking-[-0.006em] text-muted-foreground">
                  {selectedAddress.city}, {selectedAddress.district}, {selectedAddress.street}, {selectedAddress.house}
                </p>
                {selectedAddress.extra && (
                  <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground mt-1">
                    {selectedAddress.extra}
                  </p>
                )}
                </div>
              </div>
            )}

            <div className="space-y-2 text-[14px] font-normal tracking-[-0.006em] border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.subtotal')}</span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.delivery')}</span>
                <span className="tabular-nums">{formatPrice(deliveryCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('checkout.estDelivery')}</span>
                <span>{t('checkout.businessDays')}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-[16px] font-bold tracking-[-0.014em] text-foreground">
                <span>{t('common.total')}</span>
                <span className="tabular-nums">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSearchParams(effectiveOrderId ? { step: '1', orderId: String(effectiveOrderId) } : { step: '1' }, { replace: true })}
                className="hidden md:flex flex-1 h-12 items-center justify-center border border-border rounded-xl text-[14px] font-medium tracking-[-0.011em] hover:bg-muted transition-colors"
              >
                {t('checkout.backButton')}
              </button>
              <button
                onClick={() => {
                  if (!effectiveOrderId) {
                    setSearchParams({ step: '1' }, { replace: true });
                    return;
                  }
                  setSearchParams({ step: '3', orderId: String(effectiveOrderId) }, { replace: true });
                }}
                className="flex-1 h-12 bg-accent text-accent-foreground rounded-xl font-semibold text-[15px] tracking-[-0.014em] hover:bg-accent/90 transition-colors"
              >
                {t('checkout.continueToPayment')}
              </button>
            </div>
          </div>
          </>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <>
            <div className="md:hidden relative flex items-center justify-center mb-4">
              <button
                onClick={() => setSearchParams(effectiveOrderId ? { step: '2', orderId: String(effectiveOrderId) } : { step: '2' }, { replace: true })}
                className="absolute left-0 p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft size={26} />
              </button>
              <h2 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] font-display text-center">
                {t('checkout.paymentMethod')}
              </h2>
            </div>
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <h2 className="hidden md:block text-[18px] sm:text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-4">
              {t('checkout.paymentMethod')}
            </h2>
            <div className="space-y-3 mb-6">
              {(
                [
                  ['card', t('checkout.creditCard'), true],
                  ['click', 'Click', true],
                  ['payme', 'Payme', true],
                ] as const
              ).map(([val, label, enabled]) => (
                <label
                  key={val}
                  className={`flex items-center gap-3 p-4 border rounded-lg ${enabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} ${
                    paymentMethod === val ? 'border-accent bg-accent/5' : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    disabled={!enabled}
                    checked={paymentMethod === val}
                    onChange={() => enabled && setPaymentMethod(val)}
                  />
                  <span className="text-[15px] font-semibold tracking-[-0.011em]">{label}</span>
                  {!enabled && (
                    <span className="ml-auto text-[11px] font-medium tracking-[-0.005em] text-muted-foreground">{t('checkout.comingSoon')}</span>
                  )}
                </label>
              ))}
            </div>
            <div className="flex justify-between font-bold text-foreground text-[18px] sm:text-[20px] tracking-[-0.018em] mb-6">
              <span>{t('common.total')}</span>
              <span className="tabular-nums">{formatPrice(grandTotal)}</span>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSearchParams(effectiveOrderId ? { step: '2', orderId: String(effectiveOrderId) } : { step: '2' }, { replace: true })}
                className="hidden md:flex flex-1 h-12 items-center justify-center border border-border rounded-xl text-[14px] font-medium tracking-[-0.011em] hover:bg-muted transition-colors"
              >
                {t('checkout.backButton')}
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={paying}
                className="flex-1 h-12 bg-accent text-accent-foreground rounded-xl font-semibold text-[15px] tracking-[-0.014em] hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {paying ? t('payment.processing') : t('checkout.placeOrder')}
              </button>
            </div>
          </div>
          </>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default CheckoutPage;
