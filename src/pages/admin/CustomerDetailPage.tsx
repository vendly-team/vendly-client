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
  if (!customer) return <div className="py-20 text-center"><h2 className="text-[24px] font-bold tracking-[-0.018em] leading-[1.15] font-display">{t('customers.notFound')}</h2></div>;

  const custOrders = orders.filter(o => o.customerId === customer.id);
  const custReviews = reviews.filter(r => r.customerId === customer.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display">{customer.firstName} {customer.lastName}</h1>
        <Link to="/admin/customers" className="text-[14px] font-medium tracking-[-0.011em] text-accent hover:underline">{t('customers.backButton')}</Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-[15px] font-normal tracking-[-0.011em]"><strong className="font-semibold">{t('common.email')}:</strong> {customer.email}</p>
          <p className="text-[15px] font-normal tracking-[-0.011em]"><strong className="font-semibold">{t('common.phone')}:</strong> {customer.phone}</p>
          <p className="text-[15px] font-normal tracking-[-0.011em]"><strong className="font-semibold">{t('customers.registered')}:</strong> <span className="tabular-nums">{new Date(customer.registeredAt).toLocaleDateString()}</span></p>
          <p className="text-[15px] font-normal tracking-[-0.011em]"><strong className="font-semibold">{t('common.status')}:</strong> {blocked ? <span className="text-destructive font-medium">{t('customers.blocked')}</span> : <span className="text-success font-medium">{t('common.active')}</span>}</p>
          {user?.role === 'admin' && (
            <button onClick={() => { setBlocked(!blocked); toast.success(blocked ? t('customers.success.unblocked') : t('customers.success.blocked')); }} className={`mt-3 h-8 px-4 rounded text-[12px] font-semibold tracking-[-0.005em] ${blocked ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              {blocked ? t('customers.unblock') : t('customers.block')}
            </button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] mb-3 font-display">{t('customers.orderHistory', { count: custOrders.length })}</h3>
        {custOrders.length > 0 ? (
          <table className="w-full">
            <thead><tr className="border-b border-border"><th className="text-left py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{t('dashboard.orderNumber')}</th><th className="text-left py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{t('common.status')}</th><th className="text-right py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{t('common.total')}</th></tr></thead>
            <tbody>{custOrders.map(o => (
              <tr key={o.id} className="border-b border-border last:border-0 text-[14px] tracking-[-0.011em]"><td className="py-2"><Link to={`/admin/orders/${o.id}`} className="text-accent hover:underline font-medium">{o.orderNumber}</Link></td><td className="py-2"><span className={`text-[11px] font-semibold tracking-[-0.005em] px-2 py-0.5 rounded ${statusColors[o.status]}`}>{o.status}</span></td><td className="py-2 text-right tabular-nums">{formatPrice(o.totalAmount)}</td></tr>
            ))}</tbody>
          </table>
        ) : <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{t('customers.noOrders')}</p>}
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] mb-3 font-display">{t('customers.reviews', { count: custReviews.length })}</h3>
        {custReviews.map(r => (
          <div key={r.id} className="py-2 border-b border-border last:border-0 text-[14px] font-normal tracking-[-0.006em]">
            <div className="flex items-center gap-2"><span className="text-warning">{'★'.repeat(r.rating)}</span><span className={`text-[11px] font-semibold tracking-[-0.005em] px-2 py-0.5 rounded ${r.status === 'approved' ? 'bg-success/10 text-success' : r.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>{r.status}</span></div>
            <p className="text-muted-foreground mt-1">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerDetailPage;
