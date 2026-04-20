import { Link, useNavigate } from 'react-router-dom';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useCartStore } from '@/shared/store/cartStore';
import { useAuthStore } from '@/shared/store/authStore';
import { formatPrice } from '@/shared/utils';
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';

const CartPage = () => {
  const { items, removeItem, updateQty, totalAmount } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const totalItems = items.reduce((s, i) => s + i.qty, 0);

  const handleCheckout = () => {
    if (!isAuthenticated) { navigate('/login?redirect=/checkout'); return; }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <StorefrontLayout>
        <div className="container py-20 text-center animate-fade-in">
          <ShoppingCart className="mx-auto mb-4 text-muted-foreground" size={64} />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products to get started</p>
          <Link to="/" className="inline-flex h-11 px-8 items-center rounded-lg bg-accent text-accent-foreground font-semibold text-sm">Continue Shopping</Link>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="container py-6 animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">Shopping Cart ({totalItems} items)</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 bg-card border border-border rounded-lg p-4">
                <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-20 h-20 rounded-md object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.productId}`} className="text-sm font-medium text-foreground hover:text-accent line-clamp-1">{item.name}</Link>
                  <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{formatPrice(item.price)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                  <div className="flex items-center border border-border rounded">
                    <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted"><Minus size={14} /></button>
                    <span className="w-10 text-center text-sm">{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, item.qty + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted"><Plus size={14} /></button>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(item.price * item.qty)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:w-80">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatPrice(totalAmount)}</span></div>
                <p className="text-xs text-muted-foreground">Delivery cost calculated at checkout</p>
              </div>
              <hr className="border-border mb-4" />
              <div className="flex justify-between font-semibold text-foreground mb-4">
                <span>Total</span><span>{formatPrice(totalAmount)}</span>
              </div>
              <button onClick={handleCheckout} className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-sm hover:bg-accent/90">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default CartPage;
