import { Link, useLocation } from 'react-router-dom';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { CheckCircle } from 'lucide-react';

const CheckoutSuccessPage = () => {
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || 'ORD-2025-000';

  return (
    <StorefrontLayout>
      <div className="container py-20 text-center animate-fade-in">
        <CheckCircle className="mx-auto mb-6 text-success" size={80} />
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Order Placed Successfully!</h1>
        <p className="text-muted-foreground mb-6">Your order number is <strong>{orderNumber}</strong></p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/profile/orders" className="h-11 px-8 inline-flex items-center rounded-lg bg-accent text-accent-foreground font-semibold text-sm">Go to My Orders</Link>
          <Link to="/" className="h-11 px-8 inline-flex items-center rounded-lg border border-border text-foreground font-medium text-sm">Continue Shopping</Link>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default CheckoutSuccessPage;
