import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orders } from '@/shared/data/orders';
import { customers } from '@/shared/data/customers';
import { formatPrice } from '@/shared/utils';
import { toast } from 'sonner';
import type { OrderStatus } from '@/shared/data/orders';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusColors: Record<string, string> = { new: 'bg-info/10 text-info', accepted: 'bg-purple-100 text-purple-700', in_transit: 'bg-warning/10 text-warning', delivered: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive' };

const AdminOrderDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const order = orders.find(o => o.id === id);
  const [status, setStatus] = useState<OrderStatus>(order?.status || 'new');
  const [notes, setNotes] = useState<{text: string; date: string}[]>([]);
  const [noteText, setNoteText] = useState('');

  if (!order) return <div className="py-20 text-center"><h2 className="text-[24px] font-bold tracking-[-0.018em] leading-[1.15] font-display">{t('orders.notFound')}</h2></div>;

  const customer = customers.find(c => c.id === order.customerId);

  const handleStatusChange = () => {
    toast.success(t('orders.success.statusUpdated', { status }));
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes([...notes, { text: noteText, date: new Date().toISOString() }]);
    setNoteText('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display tabular-nums">{order.orderNumber}</h1>
        <Link to="/admin/orders" className="text-[14px] font-medium tracking-[-0.011em] text-accent hover:underline">{t('orders.backToOrders')}</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] mb-2 font-display">{t('common.customer')}</h3>
          {customer && <>
            <p className="text-[15px] font-normal tracking-[-0.011em]">{customer.firstName} {customer.lastName}</p>
            <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{customer.email}</p>
            <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{customer.phone}</p>
            <Link to={`/admin/customers/${customer.id}`} className="text-[12px] font-medium tracking-[-0.003em] text-accent hover:underline mt-2 inline-block">{t('orders.viewCustomer')}</Link>
          </>}
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] mb-2 font-display">{t('orders.statusControl')}</h3>
          <div className="flex gap-2">
            <Select value={status} onValueChange={v => setStatus(v as OrderStatus)}>
              <SelectTrigger className="h-9 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">{t('orders.new')}</SelectItem>
                <SelectItem value="accepted">{t('orders.accepted')}</SelectItem>
                <SelectItem value="in_transit">{t('orders.inTransit')}</SelectItem>
                <SelectItem value="delivered">{t('orders.delivered')}</SelectItem>
                <SelectItem value="cancelled">{t('orders.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
            <button onClick={handleStatusChange} className="h-9 px-4 bg-accent text-accent-foreground rounded-md text-[14px] font-semibold tracking-[-0.011em]">{t('common.save')}</button>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] mb-2 font-display">{t('common.payment')}</h3>
          <p className="text-[15px] font-normal tracking-[-0.011em]">{t('orders.provider')} {order.paymentProvider || 'N/A'}</p>
          <p className="text-[15px] font-normal tracking-[-0.011em]">{t('orders.statusLabel')} <span className={`text-[11px] font-semibold tracking-[-0.005em] px-2 py-0.5 rounded ${order.paymentStatus === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{order.paymentStatus}</span></p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] mb-3 font-display">{t('orders.statusHistory')}</h3>
        <div className="space-y-2">
          {order.statusHistory.map((h, i) => (
            <div key={i} className="flex items-center gap-3 text-[14px] font-normal tracking-[-0.006em]">
              <span className={`text-[11px] font-semibold tracking-[-0.005em] px-2 py-0.5 rounded ${statusColors[h.status]}`}>{h.status}</span>
              <span className="text-muted-foreground tabular-nums">{new Date(h.date).toLocaleString()}</span>
              {h.note && <span className="text-muted-foreground">— {h.note}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] mb-3 font-display">{t('orders.items')}</h3>
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <img src={item.productImage || '/placeholder.svg'} className="w-10 h-10 rounded bg-muted object-contain" alt="" />
            <div className="flex-1"><p className="text-[14px] font-semibold tracking-[-0.011em]">{item.productName}</p><p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground tabular-nums">SKU: {item.sku} × {item.qty}</p></div>
            <span className="text-[14px] font-semibold tracking-[-0.011em] tabular-nums">{formatPrice(item.priceSnapshot * item.qty)}</span>
          </div>
        ))}
        <div className="border-t border-border pt-3 mt-3 space-y-1 text-[14px] font-normal tracking-[-0.006em]">
          <div className="flex justify-between"><span>{t('common.subtotal')}</span><span className="tabular-nums">{formatPrice(order.totalAmount - order.deliveryCost)}</span></div>
          <div className="flex justify-between"><span>{t('common.delivery')}</span><span className="tabular-nums">{formatPrice(order.deliveryCost)}</span></div>
          <div className="flex justify-between font-bold tracking-[-0.011em]"><span>{t('common.total')}</span><span className="tabular-nums">{formatPrice(order.totalAmount)}</span></div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] mb-3 font-display">{t('orders.internalNotes')}</h3>
        <div className="flex gap-2 mb-3">
          <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder={t('orders.addNotePlaceholder')} className="flex-1 h-9 px-3 glass-input rounded-md text-[14px] font-normal tracking-[-0.011em]" />
          <button onClick={addNote} className="h-9 px-4 bg-accent text-accent-foreground rounded-md text-[14px] font-semibold tracking-[-0.011em]">{t('common.add')}</button>
        </div>
        {notes.map((n, i) => (
          <div key={i} className="text-[14px] font-normal tracking-[-0.006em] py-2 border-b border-border last:border-0">
            <span className="text-muted-foreground text-[12px] tabular-nums">{new Date(n.date).toLocaleString()}</span>
            <p>{n.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
