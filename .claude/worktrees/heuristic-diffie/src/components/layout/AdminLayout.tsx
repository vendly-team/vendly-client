import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import { LayoutDashboard, Package, Grid, ShoppingBag, Users, Star, Tag, RefreshCw, Shield, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/categories', icon: Grid, label: 'Categories' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/admin/customers', icon: Users, label: 'Customers' },
    { to: '/admin/reviews', icon: Star, label: 'Reviews' },
    { to: '/admin/discounts', icon: Tag, label: 'Discounts' },
    ...(user?.role === 'admin' ? [
      { to: '/admin/sync-logs', icon: RefreshCw, label: 'Sync Logs' },
      { to: '/admin/users', icon: Shield, label: 'Users' },
    ] : []),
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0 transition-all hidden md:flex flex-col`}>
        <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
          {!collapsed && <span className="font-display font-bold text-lg text-sidebar-primary">baytech</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-sidebar-foreground/60 hover:text-sidebar-foreground"><Menu size={18} /></button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-sidebar-accent text-sidebar-primary font-medium' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'}`}>
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-sidebar-border">
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 w-full">
            <LogOut size={18} />{!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{user?.firstName} {user?.lastName}</span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${user?.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-info/10 text-info'}`}>{user?.role}</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto animate-fade-in"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;
