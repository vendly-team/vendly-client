import { useParams, Link } from 'react-router-dom';
import { customers } from '@/shared/data/customers';
import { orders } from '@/shared/data/orders';
import { reviews } from '@/shared/data/reviews';
import { formatPrice } from '@/shared/utils';
import { useAuthStore } from '@/shared/store/authStore';
import { toast } from 'sonner';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const statusColors: Record<string, string> = { new: 'bg-info/10 text-info', accepted: 'bg-purple-100 text-purple-700', in_transit: 'bg-warning/10 text-warning', delivered: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive' };

const CustomerDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const customer = customers.find(c => c.id === id);
  const { user } = useAuthStore();
  const [blocked, setBlocked] = useState(customer?.isBlocked || false);
  if (!customer) return <div className="py-20 text-center"><h2 className="text-xl font-bold">{t('customers.notFound')}</h2></div>;

  const custOrders = orders.filter(o => o.customerId === customer.id);
  const custReviews = reviews.filter(r => r.customerId === customer.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">{customer.firstName} {customer.lastName}</h1>
        <Link to="/admin/customers" className="text-sm text-accent hover:underline">{t('customers.backButton')}</Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm"><strong>{t('common.email')}:</strong> {customer.email}</p>
          <p className="text-sm"><strong>{t('common.phone')}:</strong> {customer.phone}</p>
          <p className="text-sm"><strong>{t('customers.registered')}:</strong> {new Date(customer.registeredAt).toLocaleDateString()}</p>
          <p className="text-sm"><strong>{t('common.status')}:</strong> {blocked ? <span className="text-destructive">{t('customers.blocked')}</span> : <span className="text-success">{t('common.active')}</span>}</p>
          {user?.role === 'admin' && (
            <button onClick={() => { setBlocked(!blocked); toast.success(blocked ? t('customers.success.unblocked') : t('customers.success.blocked')); }} className={`mt-3 h-8 px-4 rounded text-xs font-medium ${blocked ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              {blocked ? t('customers.unblock') : t('customers.block')}
            </button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-3">{t('customers.orderHistory', { count: custOrders.length })}</h3>
        {custOrders.length > 0 ? (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border"><th className="text-left py-2">{t('dashboard.orderNumber')}</th><th className="text-left py-2">{t('common.status')}</th><th className="text-right py-2">{t('common.total')}</th></tr></thead>
            <tbody>{custOrders.map(o => (
              <tr key={o.id} className="border-b border-border last:border-0"><td className="py-2"><Link to={`/admin/orders/${o.id}`} className="text-accent hover:underline">{o.orderNumber}</Link></td><td className="py-2"><span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[o.status]}`}>{o.status}</span></td><td className="py-2 text-right">{formatPrice(o.totalAmount)}</td></tr>
            ))}</tbody>
          </table>
        ) : <p className="text-sm text-muted-foreground">{t('customers.noOrders')}</p>}
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-3">{t('customers.reviews', { count: custReviews.length })}</h3>
        {custReviews.map(r => (
          <div key={r.id} className="py-2 border-b border-border last:border-0 text-sm">
            <div className="flex items-center gap-2"><span className="text-warning">{'★'.repeat(r.rating)}</span><span className={`text-xs px-2 py-0.5 rounded ${r.status === 'approved' ? 'bg-success/10 text-success' : r.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>{r.status}</span></div>
            <p className="text-muted-foreground mt-1">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerDetailPage;
