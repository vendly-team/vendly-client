import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatPrice } from '@/shared/utils';
import { useProductPlaceholder } from '@/hooks/useProductPlaceholder';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useAdminOrder,
  ORDER_STATUS_COLORS,
  ALLOWED_NEXT_STATUS,
  isCancellable,
  orderStatusKey,
} from '@/features/orders';

const payLabel = (s: string) => `statusLabels.${s.toLowerCase()}`;

const AdminOrderDetailPage = () => {
  const { t } = useTranslation();
  const placeholder = useProductPlaceholder();
  const { id } = useParams();
  const { order, loading, error, working, updateStatus, addNote, cancel } = useAdminOrder(id ? Number(id) : undefined);

  const [targetStatus, setTargetStatus] = useState<string>('');
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (order) setTargetStatus(order.status);
  }, [order]);

  if (loading) {
    return <div className="py-20 text-center"><Loader2 className="mx-auto text-accent animate-spin" size={40} /></div>;
  }

  if (error || !order) {
    return <div className="py-20 text-center"><h2 className="text-[24px] font-bold tracking-[-0.018em] leading-[1.15] font-display">{t('orders.notFound')}</h2></div>;
  }

  const nextOptions = ALLOWED_NEXT_STATUS[order.status] ?? [];
  const statusOptions = [order.status, ...nextOptions];
  const canSave = targetStatus !== order.status;

  const handleSave = () => {
    if (canSave) updateStatus(targetStatus, undefined);
  };

  const handleCancel = () => {
    if (window.confirm(t('orders.confirmCancel'))) cancel();
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    const ok = await addNote(noteText.trim());
    if (ok) setNoteText('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display tabular-nums">{order.orderNumber}</h1>
        <Link to="/admin/orders" className="text-[14px] font-medium tracking-[-0.011em] text-accent hover:underline">{t('orders.backToOrders')}</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Customer */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] mb-2 font-display">{t('common.customer')}</h3>
          <p className="text-[15px] font-normal tracking-[-0.011em]">{order.customerName || 'Unknown'}</p>
        </div>

        {/* Status control */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] mb-2 font-display">{t('orders.statusControl')}</h3>
          <div className="flex gap-2">
            <Select value={targetStatus} onValueChange={setTargetStatus} disabled={statusOptions.length <= 1}>
              <SelectTrigger className="h-9 flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(s => (
                  <SelectItem key={s} value={s}>{t(orderStatusKey(s))}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button onClick={handleSave} disabled={!canSave || working} className="h-9 px-4 bg-accent text-accent-foreground rounded-md text-[14px] font-semibold tracking-[-0.011em] disabled:opacity-50 disabled:cursor-not-allowed">{t('common.save')}</button>
          </div>
          {isCancellable(order.status) && (
            <button onClick={handleCancel} disabled={working} className="mt-2 h-9 w-full border border-destructive/30 text-destructive rounded-md text-[14px] font-medium tracking-[-0.011em] disabled:opacity-50">{t('orders.cancelOrder')}</button>
          )}
        </div>

        {/* Payment */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] mb-2 font-display">{t('common.payment')}</h3>
          <p className="text-[15px] font-normal tracking-[-0.011em]">{t('orders.provider')} {order.payment?.provider || 'N/A'}</p>
          <p className="text-[15px] font-normal tracking-[-0.011em] mt-1">{t('orders.statusLabel')} <span className={`text-[11px] font-semibold tracking-[-0.005em] px-2 py-0.5 rounded ${order.paymentStatus === 'Paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{t(payLabel(order.paymentStatus))}</span></p>
        </div>
      </div>

      {/* Delivery / BTS */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] mb-2 font-display">{t('common.delivery')}</h3>
        <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{order.delivery.city}, {order.delivery.district}, {order.delivery.street}, {order.delivery.house}</p>
        <div className="flex flex-wrap items-center gap-4 mt-2">
          {order.delivery.btsBarcode && <span className="text-[13px] tabular-nums text-muted-foreground">{t('orders.barcode')}: <strong className="text-foreground">{order.delivery.btsBarcode}</strong></span>}
          {order.delivery.btsLastStatusName && <span className="text-[13px] text-muted-foreground">{order.delivery.btsLastStatusName}</span>}
          {order.delivery.btsTrackingUrl && <a href={order.delivery.btsTrackingUrl} target="_blank" rel="noreferrer" className="text-[13px] font-medium text-accent hover:underline">{t('orders.trackPackage')}</a>}
          {order.delivery.btsStickerUrl && <a href={order.delivery.btsStickerUrl} target="_blank" rel="noreferrer" className="text-[13px] font-medium text-accent hover:underline">{t('orders.sticker')}</a>}
        </div>
      </div>

      {/* Status history */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] mb-3 font-display">{t('orders.statusHistory')}</h3>
        <div className="space-y-2">
          {order.statusHistory.map((h, i) => (
            <div key={i} className="flex items-center gap-3 text-[14px] font-normal tracking-[-0.006em]">
              <span className={`text-[11px] font-semibold tracking-[-0.005em] px-2 py-0.5 rounded ${ORDER_STATUS_COLORS[h.status] ?? ''}`}>{t(orderStatusKey(h.status))}</span>
              <span className="text-muted-foreground tabular-nums">{new Date(h.createdAt).toLocaleString()}</span>
              {h.note && <span className="text-muted-foreground">— {h.note}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] mb-3 font-display">{t('orders.items')}</h3>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <img src={item.image || placeholder} className="w-10 h-10 rounded bg-muted object-contain" alt="" />
            <div className="flex-1"><p className="text-[14px] font-semibold tracking-[-0.011em]">{item.productName}</p><p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground tabular-nums">SKU: {item.sku} × {item.qty}</p></div>
            <span className="text-[14px] font-semibold tracking-[-0.011em] tabular-nums">{formatPrice(item.total)}</span>
          </div>
        ))}
        <div className="border-t border-border pt-3 mt-3 space-y-1 text-[14px] font-normal tracking-[-0.006em]">
          <div className="flex justify-between"><span>{t('common.subtotal')}</span><span className="tabular-nums">{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between"><span>{t('common.delivery')}</span><span className="tabular-nums">{formatPrice(order.deliveryCost)}</span></div>
          <div className="flex justify-between font-bold tracking-[-0.011em]"><span>{t('common.total')}</span><span className="tabular-nums">{formatPrice(order.totalAmount)}</span></div>
        </div>
      </div>

      {/* Internal notes */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] mb-3 font-display">{t('orders.internalNotes')}</h3>
        <div className="flex gap-2 mb-3">
          <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder={t('orders.addNotePlaceholder')} className="flex-1 h-9 px-3 glass-input rounded-md text-[14px] font-normal tracking-[-0.011em]" />
          <button onClick={handleAddNote} disabled={working} className="h-9 px-4 bg-accent text-accent-foreground rounded-md text-[14px] font-semibold tracking-[-0.011em] disabled:opacity-50">{t('common.add')}</button>
        </div>
        {order.notes.map((n) => (
          <div key={n.id} className="text-[14px] font-normal tracking-[-0.006em] py-2 border-b border-border last:border-0">
            <span className="text-muted-foreground text-[12px] tabular-nums">{new Date(n.createdAt).toLocaleString()}</span>
            <p>{n.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
