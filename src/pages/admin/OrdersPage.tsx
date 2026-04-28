import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { orders as allOrders, type OrderStatus } from '@/shared/data/orders';
import { customers } from '@/shared/data/customers';
import { formatPrice } from '@/shared/utils';
import { Search, Eye, LayoutList, Kanban } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusVariant: Record<string, string> = {
  new: 'border-info/15 bg-info/10 text-info hover:bg-info/10',
  accepted: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50',
  in_transit: 'border-warning/15 bg-warning/10 text-warning hover:bg-warning/10',
  delivered: 'border-success/15 bg-success/10 text-success hover:bg-success/10',
  cancelled: 'border-destructive/15 bg-destructive/10 text-destructive hover:bg-destructive/10',
};

const payVariant: Record<string, string> = {
  pending: 'border-warning/15 bg-warning/10 text-warning hover:bg-warning/10',
  paid: 'border-success/15 bg-success/10 text-success hover:bg-success/10',
  failed: 'border-destructive/15 bg-destructive/10 text-destructive hover:bg-destructive/10',
};

const columnAccent: Record<string, string> = {
  new: 'bg-info/10 text-info border-info/20',
  accepted: 'bg-purple-50 text-purple-700 border-purple-200',
  in_transit: 'bg-warning/10 text-warning border-warning/20',
  delivered: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const STATUSES: OrderStatus[] = ['new', 'accepted', 'in_transit', 'delivered', 'cancelled'];

const AdminOrdersPage = () => {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState<'table' | 'board'>(() => {
    const saved = localStorage.getItem('admin:orders:view');
    return saved === 'board' ? 'board' : 'table';
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 20;

  const filtered = useMemo(() => {
    let list = [...allOrders];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(o =>
        o.orderNumber.toLowerCase().includes(s) ||
        customers.find(c => c.id === o.customerId)?.firstName.toLowerCase().includes(s),
      );
    }
    if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter);
    return list;
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const resetPage = () => setPage(1);

  const boardColumns = useMemo(() => {
    const searchFiltered = search
      ? allOrders.filter(o => {
          const s = search.toLowerCase();
          return (
            o.orderNumber.toLowerCase().includes(s) ||
            customers.find(c => c.id === o.customerId)?.firstName.toLowerCase().includes(s)
          );
        })
      : allOrders;

    return STATUSES.map(status => ({
      status,
      orders: searchFiltered.filter(o => o.status === status),
    }));
  }, [search]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">{t('orders.title')}</h1>

        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/40">
          <button
            type="button"
            onClick={() => { setView('table'); localStorage.setItem('admin:orders:view', 'table'); }}
            className={`flex h-7 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all duration-200 ${
              view === 'table'
                ? 'bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08)] text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutList size={13} />
            {t('orders.tableView', { defaultValue: 'Table' })}
          </button>
          <button
            type="button"
            onClick={() => { setView('board'); localStorage.setItem('admin:orders:view', 'board'); }}
            className={`flex h-7 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all duration-200 ${
              view === 'board'
                ? 'bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08)] text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Kanban size={13} />
            {t('orders.boardView', { defaultValue: 'Board' })}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-[1] pointer-events-none" />
          <input
            placeholder={t('orders.searchPlaceholder')}
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
            className="h-9 w-52 rounded-md glass-input pl-9 pr-3 text-sm"
          />
        </div>
        {view === 'table' && (
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); resetPage(); }}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('orders.allStatus')}</SelectItem>
              <SelectItem value="new">{t('orders.new')}</SelectItem>
              <SelectItem value="accepted">{t('orders.accepted')}</SelectItem>
              <SelectItem value="in_transit">{t('orders.inTransit')}</SelectItem>
              <SelectItem value="delivered">{t('orders.delivered')}</SelectItem>
              <SelectItem value="cancelled">{t('orders.cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table view */}
      {view === 'table' && (
        <>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t('orders.orderNumber')}</TableHead>
                <TableHead>{t('common.customer')}</TableHead>
                <TableHead>{t('common.date')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.payment')}</TableHead>
                <TableHead className="text-right">{t('common.total')}</TableHead>
                <TableHead className="sticky right-0 w-20 bg-card border-l border-border/40 text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {t('orders.empty', { defaultValue: 'No orders found' })}
                  </TableCell>
                </TableRow>
              )}
              {paged.map(o => {
                const cust = customers.find(c => c.id === o.customerId);
                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.orderNumber}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {cust ? `${cust.firstName} ${cust.lastName}` : 'Unknown'}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString(i18n.language)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusVariant[o.status] ?? ''}>
                        {t(`orders.${o.status}`, { defaultValue: o.status })}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={payVariant[o.paymentStatus] ?? ''}>
                        {t(`orders.pay_${o.paymentStatus}`, { defaultValue: o.paymentStatus })}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatPrice(o.totalAmount)}</TableCell>
                    <TableCell className="sticky right-0 bg-card border-l border-border/40">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:bg-accent/10 hover:text-accent"
                          asChild
                          title={t('common.view')}
                        >
                          <Link to={`/admin/orders/${o.id}`} aria-label={t('common.view')}>
                            <Eye size={15} />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`h-8 w-8 rounded text-sm ${currentPage === pageNumber ? 'bg-accent text-accent-foreground' : 'border border-border'}`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Board view */}
      {view === 'board' && (
        <div className="w-full md:w-[90%]">
          {/* Sticky header bar — lives outside any overflow container so sticky works */}
          <div className="sticky top-0 z-20 flex gap-3 bg-background/95 backdrop-blur-sm pt-1 pb-3">
            {boardColumns.map(({ status, orders: colOrders }) => (
              <div
                key={status}
                className={`flex flex-1 min-w-0 items-center justify-between px-3 py-2 rounded-xl border ${columnAccent[status]}`}
              >
                <span className="text-xs font-semibold uppercase tracking-wide truncate">
                  {t(`orders.${status}`, { defaultValue: status })}
                </span>
                <span className="text-xs font-bold tabular-nums ml-2 shrink-0">{colOrders.length}</span>
              </div>
            ))}
          </div>

          {/* Card columns — no individual scroll, whole page scrolls */}
          <div className="flex gap-3">
            {boardColumns.map(({ status, orders: colOrders }) => (
              <div key={status} className="flex flex-col flex-1 min-w-[140px] gap-2.5">
                {colOrders.length === 0 && (
                  <div className="flex items-center justify-center h-20 rounded-2xl border border-dashed border-border/60 text-xs text-muted-foreground">
                    {t('orders.empty', { defaultValue: 'No orders' })}
                  </div>
                )}
                {colOrders.map(o => {
                  const cust = customers.find(c => c.id === o.customerId);
                  return (
                    <Link
                      key={o.id}
                      to={`/admin/orders/${o.id}`}
                      className="block rounded-2xl bg-card border border-border/50 p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.06)] hover:border-border transition-all duration-200 ease-[cubic-bezier(0.28,0.11,0.32,1)] active:scale-[0.98]"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <span className="text-sm font-semibold tracking-tight text-foreground leading-tight">
                          {o.orderNumber}
                        </span>
                        <Badge variant="outline" className={`${payVariant[o.paymentStatus]} shrink-0 text-[10px] px-1.5 py-0`}>
                          {t(`orders.pay_${o.paymentStatus}`, { defaultValue: o.paymentStatus })}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2.5 truncate">
                        {cust ? `${cust.firstName} ${cust.lastName}` : 'Unknown'}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">
                          {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                        </span>
                        <span className="text-sm font-semibold text-foreground tabular-nums">
                          {formatPrice(o.totalAmount)}
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString(i18n.language)}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
