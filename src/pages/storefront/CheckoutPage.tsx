import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useCartStore } from '@/shared/store/cartStore';
import { useCheckoutSelectionStore } from '@/shared/store/checkoutSelectionStore';
import { useOrderStore } from '@/shared/store/orderStore';
import { useAuthStore } from '@/shared/store/authStore';
import { useAddresses } from '@/features/addresses';
import { AddressSelector } from '@/features/checkout';
import { formatPrice } from '@/shared/utils';
import { Check } from 'lucide-react';

const DELIVERY_COST = 10;

const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCartStore();
  const { addresses } = useAddresses();
  const { selectedAddressId } = useCheckoutSelectionStore();
  const { addOrder } = useOrderStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'click' | 'payme' | 'card'>('card');

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const grandTotal = totalAmount + DELIVERY_COST;

  const handlePlaceOrder = () => {
    if (!selectedAddress) return;

    const orderNum = `ORD-2025-${String(Date.now()).slice(-3)}`;

    addOrder({
      id: 'o-' + Date.now(),
      orderNumber: orderNum,
      customerId: user?.id || 'c1',
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.name,
        productImage: i.image,
        sku: i.sku,
        qty: i.qty,
        priceSnapshot: i.price,
      })),
      status: 'new',
      paymentStatus: 'paid',
      paymentProvider: paymentMethod,
      totalAmount: grandTotal,
      deliveryAddress: {
        city: selectedAddress.city,
        district: selectedAddress.district,
        street: `${selectedAddress.street}, ${selectedAddress.house}`,
      },
      deliveryCost: DELIVERY_COST,
      estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      statusHistory: [{ status: 'new', date: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    });
    clearCart();
    navigate('/checkout/success', { replace: true, state: { orderNumber: orderNum } });
  };

  const steps = [t('checkout.address'), t('checkout.summary'), t('checkout.payment')];

  return (
    <StorefrontLayout>
      <div className="container py-6 animate-fade-in max-w-3xl mx-auto px-4">
        <h1 className="text-[24px] sm:text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground mb-6">
          {t('checkout.title')}
        </h1>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 flex-wrap">
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
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-4">
              {t('checkout.deliveryAddress')}
            </h2>
            <AddressSelector onContinue={() => setStep(2)} />
          </div>
        )}

        {/* Step 2: Summary */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-4">
              {t('checkout.orderSummary')}
            </h2>

            {selectedAddress && (
              <div className="mb-6 p-3 border border-border rounded-lg">
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
            )}

            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img
                    src={item.image || '/placeholder.svg'}
                    alt=""
                    className="w-12 h-12 rounded bg-muted object-contain"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold tracking-[-0.011em] truncate">{item.name}</p>
                    <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground tabular-nums">
                      {t('common.qty')}: {item.qty}
                    </p>
                  </div>
                  <span className="text-[14px] font-semibold tracking-[-0.011em] tabular-nums">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-[14px] font-normal tracking-[-0.006em] border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.subtotal')}</span>
                <span className="tabular-nums">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.delivery')}</span>
                <span className="tabular-nums">{formatPrice(DELIVERY_COST)}</span>
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

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 h-11 border border-border rounded-lg text-[15px] font-medium tracking-[-0.011em]"
              >
                {t('checkout.backButton')}
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-[15px] tracking-[-0.014em]"
              >
                {t('checkout.continueToPayment')}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-4">
              {t('checkout.paymentMethod')}
            </h2>
            <div className="space-y-3 mb-6">
              {(
                [
                  ['click', 'Click'],
                  ['payme', 'Payme'],
                  ['card', t('checkout.creditCard')],
                ] as const
              ).map(([val, label]) => (
                <label
                  key={val}
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${
                    paymentMethod === val ? 'border-accent bg-accent/5' : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === val}
                    onChange={() => setPaymentMethod(val)}
                  />
                  <span className="text-[15px] font-semibold tracking-[-0.011em]">{label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between font-bold text-foreground text-[18px] sm:text-[20px] tracking-[-0.018em] mb-6">
              <span>{t('common.total')}</span>
              <span className="tabular-nums">{formatPrice(grandTotal)}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 h-11 border border-border rounded-lg text-[15px] font-medium tracking-[-0.011em]"
              >
                {t('checkout.backButton')}
              </button>
              <button
                onClick={handlePlaceOrder}
                className="flex-1 h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-[15px] tracking-[-0.014em]"
              >
                {t('checkout.placeOrder')}
              </button>
            </div>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default CheckoutPage;
