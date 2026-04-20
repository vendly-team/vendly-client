import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { orders as allOrders } from '@/shared/data/orders';
import { customers } from '@/shared/data/customers';
import { formatPrice } from '@/shared/utils';
import { Search } from 'lucide-react';

const statusColors: Record<string, string> = { new: 'bg-info/10 text-info', accepted: 'bg-purple-100 text-purple-700', in_transit: 'bg-warning/10 text-warning', delivered: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive' };
const payColors: Record<string, string> = { pending: 'bg-warning/10 text-warning', paid: 'bg-success/10 text-success', failed: 'bg-destructive/10 text-destructive' };

const AdminOrdersPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  const filtered = useMemo(() => {
    let list = [...allOrders];
    if (search) { const s = search.toLowerCase(); list = list.filter(o => o.orderNumber.toLowerCase().includes(s) || customers.find(c => c.id === o.customerId)?.firstName.toLowerCase().includes(s)); }
    if (statusFilter) list = list.filter(o => o.status === statusFilter);
    return list;
  }, [search, statusFilter]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Orders</h1>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9 pr-3 glass-input rounded-md text-sm w-52" /></div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 px-3 glass-input rounded-md text-sm"><option value="">All Status</option><option value="new">New</option><option value="accepted">Accepted</option><option value="in_transit">In Transit</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-medium text-muted-foreground">Order #</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Payment</th><th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody>
            {paged.map(o => {
              const cust = customers.find(c => c.id === o.customerId);
              return (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cust ? `${cust.firstName} ${cust.lastName}` : 'Unknown'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[o.status]}`}>{o.status}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${payColors[o.paymentStatus]}`}>{o.paymentStatus}</span></td>
                  <td className="px-4 py-3 text-right">{formatPrice(o.totalAmount)}</td>
                  <td className="px-4 py-3"><Link to={`/admin/orders/${o.id}`} className="text-accent hover:underline text-xs">View</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
