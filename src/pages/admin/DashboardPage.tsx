import { Link } from 'react-router-dom';
import { orders } from '@/shared/data/orders';
import { products } from '@/shared/data/products';
import { formatPrice } from '@/shared/utils';
import { ShoppingBag, DollarSign, Clock, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const statusColors: Record<string, string> = { new: 'bg-info/10 text-info', accepted: 'bg-purple-100 text-purple-700', in_transit: 'bg-warning/10 text-warning', delivered: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive' };

const DashboardPage = () => {
  const { t } = useTranslation();
  const todayOrders = orders.filter(() => true); // mock: treat all as recent
  const pendingOrders = orders.filter(o => o.status === 'new' || o.status === 'accepted');
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);
  const lowStock = products.filter(p => p.stock < 5 && p.stock > 0);

  const chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({
    day: d, orders: Math.floor(Math.random() * 10) + 2, revenue: Math.floor(Math.random() * 5000) + 500,
  }));

  const stats = [
    { label: t('dashboard.todaysOrders'), value: todayOrders.length, icon: ShoppingBag, color: 'text-info' },
    { label: t('dashboard.revenue'), value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-success' },
    { label: t('dashboard.pendingOrders'), value: pendingOrders.length, icon: Clock, color: 'text-warning' },
    { label: t('dashboard.totalProducts'), value: products.length, icon: Package, color: 'text-accent' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">{t('dashboard.title')}</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-4">{t('dashboard.ordersChart')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line type="monotone" dataKey="orders" stroke="hsl(32, 95%, 52%)" strokeWidth={2} /></LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-4">{t('dashboard.revenueChart')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line type="monotone" dataKey="revenue" stroke="hsl(142, 70%, 40%)" strokeWidth={2} /></LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-4">{t('dashboard.recentOrders')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-left py-2 text-muted-foreground font-medium">{t('dashboard.orderNumber')}</th><th className="text-left py-2 text-muted-foreground font-medium">{t('common.status')}</th><th className="text-right py-2 text-muted-foreground font-medium">{t('common.total')}</th></tr></thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="py-2"><Link to={`/admin/orders/${o.id}`} className="text-accent hover:underline">{o.orderNumber}</Link></td>
                    <td className="py-2"><span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[o.status]}`}>{o.status}</span></td>
                    <td className="py-2 text-right">{formatPrice(o.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-4">{t('dashboard.lowStock')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-left py-2 text-muted-foreground font-medium">{t('common.product')}</th><th className="text-left py-2 text-muted-foreground font-medium">{t('common.sku')}</th><th className="text-right py-2 text-muted-foreground font-medium">{t('common.stock')}</th></tr></thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="py-2"><Link to={`/admin/products/${p.id}/edit`} className="text-accent hover:underline">{p.name}</Link></td>
                    <td className="py-2 text-muted-foreground">{p.sku}</td>
                    <td className="py-2 text-right text-sale font-medium">{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
