import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useCartStore } from '@/shared/store/cartStore';
import { useAddressStore } from '@/shared/store/addressStore';
import { useOrderStore } from '@/shared/store/orderStore';
import { useAuthStore } from '@/shared/store/authStore';
import { formatPrice } from '@/shared/utils';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

const DELIVERY_COST = 10;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCartStore();
  const { addresses, addAddress } = useAddressStore();
  const { addOrder } = useOrderStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(addresses.find(a => a.isDefault)?.id || '');
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0);
  const [newAddr, setNewAddr] = useState({ city: '', district: '', street: '', house: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState<'click' | 'payme' | 'card'>('card');

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const grandTotal = totalAmount + DELIVERY_COST;

  const handleStep1 = () => {
    if (showNewAddress) {
      if (!newAddr.city || !newAddr.district || !newAddr.street || !newAddr.house) {
        toast.error('Please fill all address fields');
        return;
      }
      addAddress({ ...newAddr, isDefault: addresses.length === 0 });
      setShowNewAddress(false);
    } else if (!selectedAddressId) {
      toast.error('Please select an address');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = () => {
    const orderNum = `ORD-2025-${String(Date.now()).slice(-3)}`;
    const addr = selectedAddress || { city: newAddr.city, district: newAddr.district, street: `${newAddr.street} ${newAddr.house}` };
    addOrder({
      id: 'o-' + Date.now(),
      orderNumber: orderNum,
      customerId: user?.id || 'c1',
      items: items.map(i => ({ productId: i.productId, productName: i.name, productImage: i.image, sku: i.sku, qty: i.qty, priceSnapshot: i.price })),
      status: 'new',
      paymentStatus: 'paid',
      paymentProvider: paymentMethod,
      totalAmount: grandTotal,
      deliveryAddress: { city: addr.city, district: addr.district, street: 'street' in addr ? addr.street : `${(addr as any).street} ${(addr as any).house}` },
      deliveryCost: DELIVERY_COST,
      estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      statusHistory: [{ status: 'new', date: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    });
    clearCart();
    navigate('/checkout/success', { replace: true, state: { orderNumber: orderNum } });
  };

  const steps = ['Address', 'Summary', 'Payment'];

  return (
    <StorefrontLayout>
      <div className="container py-6 animate-fade-in max-w-3xl mx-auto">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i + 1 <= step ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                {i + 1 < step ? <Check size={16} /> : i + 1}
              </div>
              <span className={`text-sm ${i + 1 <= step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`w-12 h-0.5 ${i + 1 < step ? 'bg-accent' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Address */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
            {addresses.length > 0 && !showNewAddress && (
              <div className="space-y-3 mb-4">
                {addresses.map((a) => (
                  <label key={a.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${selectedAddressId === a.id ? 'border-accent bg-accent/5' : 'border-border'}`}>
                    <input type="radio" name="address" checked={selectedAddressId === a.id} onChange={() => setSelectedAddressId(a.id)} className="mt-1" />
                    <div>
                      <p className="text-sm font-medium">{a.city}, {a.district}</p>
                      <p className="text-sm text-muted-foreground">{a.street}, {a.house}</p>
                      {a.isDefault && <span className="text-xs text-success font-medium">Default</span>}
                    </div>
                  </label>
                ))}
                <button onClick={() => setShowNewAddress(true)} className="text-sm text-accent hover:underline">+ Add new address</button>
              </div>
            )}
            {showNewAddress && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-foreground">City *</label>
                  <input value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">District *</label>
                  <input value={newAddr.district} onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Street *</label>
                  <input value={newAddr.street} onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">House *</label>
                  <input value={newAddr.house} onChange={(e) => setNewAddr({ ...newAddr, house: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-foreground">Notes</label>
                  <textarea value={newAddr.notes} onChange={(e) => setNewAddr({ ...newAddr, notes: e.target.value })} className="w-full h-20 p-3 glass-input rounded-md text-sm mt-1 resize-none" />
                </div>
              </div>
            )}
            <button onClick={handleStep1} className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-sm">Continue</button>
          </div>
        )}

        {/* Step 2: Summary */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img src={item.image || '/placeholder.svg'} alt="" className="w-12 h-12 rounded bg-muted object-cover" />
                  <div className="flex-1"><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">Qty: {item.qty}</p></div>
                  <span className="text-sm font-medium">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(totalAmount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{formatPrice(DELIVERY_COST)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Est. Delivery</span><span>3–5 business days</span></div>
              <hr className="border-border" />
              <div className="flex justify-between font-bold text-foreground"><span>Total</span><span>{formatPrice(grandTotal)}</span></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 h-11 border border-border rounded-lg text-sm font-medium">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-sm">Continue to Payment</button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            <div className="space-y-3 mb-6">
              {([['click', 'Click'], ['payme', 'Payme'], ['card', 'Credit / Debit Card']] as const).map(([val, label]) => (
                <label key={val} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === val ? 'border-accent bg-accent/5' : 'border-border'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === val} onChange={() => setPaymentMethod(val)} />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between font-bold text-foreground text-lg mb-6">
              <span>Total</span><span>{formatPrice(grandTotal)}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 h-11 border border-border rounded-lg text-sm font-medium">Back</button>
              <button onClick={handlePlaceOrder} className="flex-1 h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-sm">Place Order</button>
            </div>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default CheckoutPage;
