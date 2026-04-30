import { Link } from 'react-router-dom';
import { orders } from '@/shared/data/orders';
import { products } from '@/shared/data/products';
import { formatPrice } from '@/shared/utils';
import { ShoppingCart, DollarSign, Clock, Package, TrendingUp, TrendingDown, Calendar, ChevronDown } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const chartData = [
  { day: 'Mon', orders: 7,  revenue: 1500 },
  { day: 'Tue', orders: 2,  revenue: 2800 },
  { day: 'Wed', orders: 2,  revenue: 2600 },
  { day: 'Thu', orders: 10, revenue: 4200 },
  { day: 'Fri', orders: 6,  revenue: 800  },
  { day: 'Sat', orders: 7,  revenue: 4500 },
  { day: 'Sun', orders: 8,  revenue: 1500 },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  new:        { label: 'New',       className: 'bg-info/10 text-info' },
  accepted:   { label: 'Accepted',  className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  in_transit: { label: 'In Transit',className: 'bg-warning/10 text-warning' },
  delivered:  { label: 'Delivered', className: 'bg-success/10 text-success' },
  cancelled:  { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
};

function formatOrderDate(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );
}

// SVG-safe hex values (CSS vars don't resolve inside SVG attributes)
const COLOR = {
  primary: '#0071e3',
  success: '#28cd41',
  warning: '#ff9f0a',
  info:    '#32ade6',
  purple:  '#a855f7',
};

const DashboardPage = () => {
  const { t } = useTranslation();

  const todayOrders   = orders;
  const pendingOrders = orders.filter(o => o.status === 'new' || o.status === 'accepted');
  const totalRevenue  = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);
  const lowStock      = products.filter(p => p.stock < 5 && p.stock > 0);

  const stats = [
    {
      label:      t('dashboard.todaysOrders'),
      value:      String(todayOrders.length),
      icon:       ShoppingCart,
      iconBg:     'bg-info/10',
      iconColor:  'text-info',
      lineColor:  COLOR.info,
      spark:      [4, 6, 5, 8, 7, 9, 10].map(v => ({ v })),
      trend:      '+25%',
      trendUp:    true,
      trendLabel: 'vs yesterday',
    },
    {
      label:      t('dashboard.revenue'),
      value:      formatPrice(totalRevenue),
      icon:       DollarSign,
      iconBg:     'bg-success/10',
      iconColor:  'text-success',
      lineColor:  COLOR.success,
      spark:      [5, 8, 7, 11, 9, 12, 14].map(v => ({ v })),
      trend:      '+18.6%',
      trendUp:    true,
      trendLabel: 'vs last 7 days',
    },
    {
      label:      t('dashboard.pendingOrders'),
      value:      String(pendingOrders.length),
      icon:       Clock,
      iconBg:     'bg-warning/10',
      iconColor:  'text-warning',
      lineColor:  COLOR.warning,
      spark:      [10, 8, 9, 7, 8, 6, 4].map(v => ({ v })),
      trend:      '-20%',
      trendUp:    false,
      trendLabel: 'vs yesterday',
    },
    {
      label:      t('dashboard.totalProducts'),
      value:      String(products.length),
      icon:       Package,
      iconBg:     'bg-purple-100 dark:bg-purple-900/20',
      iconColor:  'text-purple-600 dark:text-purple-400',
      lineColor:  COLOR.purple,
      spark:      [8, 9, 8, 10, 9, 10, 11].map(v => ({ v })),
      trend:      '+5%',
      trendUp:    true,
      trendLabel: 'vs last 30 days',
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Title row ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] text-foreground font-display">
            {t('dashboard.title')}
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground tracking-[-0.006em]">
            Welcome back, admin! Here's what's happening with your store today.
          </p>
        </div>
        {/* Date range — visual only */}
        <button
          type="button"
          className="flex items-center gap-2 h-9 px-3.5 rounded-xl border border-border bg-card text-[13px] font-medium tracking-[-0.006em] text-foreground hover:bg-muted/50 transition-colors shrink-0 shadow-sm"
        >
          <Calendar size={14} className="text-muted-foreground" />
          <span className="hidden sm:inline">May 12 – May 18, 2025</span>
          <ChevronDown size={13} className="text-muted-foreground" />
        </button>
      </div>

      {/* ── KPI cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-2.5">
            {/* Icon + sparkline */}
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.iconBg}`}>
                <s.icon size={19} className={s.iconColor} />
              </div>
              <div className="w-[68px] h-8 opacity-70">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={s.spark}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={s.lineColor}
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Label + value */}
            <div>
              <p className="text-[12px] font-medium tracking-[-0.005em] text-muted-foreground">
                {s.label}
              </p>
              <p className="text-[24px] font-bold tracking-[-0.022em] leading-[1.15] text-foreground font-display tabular-nums mt-0.5">
                {s.value}
              </p>
            </div>

            {/* Trend */}
            <div className="flex items-center gap-1.5">
              {s.trendUp
                ? <TrendingUp  size={13} className="text-success shrink-0" />
                : <TrendingDown size={13} className="text-destructive shrink-0" />
              }
              <span className={`text-[12px] font-semibold tracking-[-0.005em] ${s.trendUp ? 'text-success' : 'text-destructive'}`}>
                {s.trend}
              </span>
              <span className="text-[12px] text-muted-foreground tracking-[-0.005em]">
                {s.trendLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Orders chart */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-[15px] font-semibold tracking-[-0.011em] text-foreground">
                {t('dashboard.ordersChart')}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-block w-3 h-[7px] rounded-sm" style={{ background: COLOR.primary }} />
                <span className="text-[12px] text-muted-foreground tracking-[-0.005em]">Orders</span>
              </div>
            </div>
            {/* Period pill — visual only */}
            <button type="button" className="flex items-center gap-1 h-7 px-2.5 rounded-lg border border-border bg-background text-[12px] font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
              7 Days <ChevronDown size={12} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLOR.primary} stopOpacity={0.13} />
                  <stop offset="95%" stopColor={COLOR.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke={COLOR.primary}
                strokeWidth={2.5}
                fill="url(#ordersGrad)"
                dot={{ r: 4, fill: COLOR.primary, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 5, fill: COLOR.primary, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue chart */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-[15px] font-semibold tracking-[-0.011em] text-foreground">
                {t('dashboard.revenueChart')}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-block w-3 h-[7px] rounded-sm" style={{ background: COLOR.success }} />
                <span className="text-[12px] text-muted-foreground tracking-[-0.005em]">Revenue ($)</span>
              </div>
            </div>
            <button type="button" className="flex items-center gap-1 h-7 px-2.5 rounded-lg border border-border bg-background text-[12px] font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
              7 Days <ChevronDown size={12} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLOR.success} stopOpacity={0.13} />
                  <stop offset="95%" stopColor={COLOR.success} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000)}K` : String(v)}
              />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                formatter={(value: unknown) => [formatPrice(Number(value)), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={COLOR.success}
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                dot={{ r: 4, fill: COLOR.success, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 5, fill: COLOR.success, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom tables ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold tracking-[-0.011em] text-foreground">
              {t('dashboard.recentOrders')}
            </h3>
            <Link to="/admin/orders" className="text-[13px] font-medium text-primary hover:underline tracking-[-0.006em]">
              View all orders →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-2.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{t('dashboard.orderNumber')}</th>
                  <th className="text-left pb-2.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{t('common.status')}</th>
                  <th className="text-right pb-2.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{t('common.total')}</th>
                  <th className="text-right pb-2.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 text-[13px] tracking-[-0.006em]">
                      <Link to={`/admin/orders/${o.id}`} className="text-primary hover:underline font-medium">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center text-[11px] font-semibold tracking-[-0.003em] px-2 py-0.5 rounded-md ${statusConfig[o.status]?.className}`}>
                        {statusConfig[o.status]?.label ?? o.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-[13px] font-medium tracking-[-0.006em] tabular-nums">
                      {formatPrice(o.totalAmount)}
                    </td>
                    <td className="py-3 text-right text-[12px] text-muted-foreground tracking-[-0.005em] tabular-nums whitespace-nowrap">
                      {formatOrderDate(o.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold tracking-[-0.011em] text-foreground">
              {t('dashboard.lowStock')}
            </h3>
            <Link to="/admin/products" className="text-[13px] font-medium text-primary hover:underline tracking-[-0.006em]">
              View all products →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-2.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{t('common.product')}</th>
                  <th className="text-left pb-2.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{t('common.sku')}</th>
                  <th className="text-right pb-2.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{t('common.stock')}</th>
                  <th className="text-right pb-2.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.images?.[0]}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover shrink-0 bg-muted border border-border"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="text-[13px] text-primary hover:underline font-medium tracking-[-0.006em] line-clamp-1 max-w-[140px]"
                        >
                          {p.name}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 text-[13px] text-muted-foreground tracking-[-0.006em] tabular-nums">
                      {p.sku}
                    </td>
                    <td className="py-3 text-right text-[13px] font-semibold text-foreground tabular-nums">
                      {p.stock}
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center text-[11px] font-semibold tracking-[-0.003em] px-2 py-0.5 rounded-md bg-destructive/10 text-destructive">
                        Low Stock
                      </span>
                    </td>
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
