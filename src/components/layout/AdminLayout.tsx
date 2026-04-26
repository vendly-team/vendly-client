import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import { LayoutDashboard, Package, Grid, ShoppingBag, Users, Star, Tag, RefreshCw, Shield, LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

const AdminLayout = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  type SidebarLink = {
    to: string;
    icon: LucideIcon;
    label: string;
    end?: boolean;
  };

  const sections: Array<{ label: string; links: SidebarLink[] }> = [
    {
      label: t("admin.sidebar.sections.overview"),
      links: [
        { to: '/admin', icon: LayoutDashboard, label: t("admin.sidebar.dashboard"), end: true },
      ],
    },
    {
      label: t("admin.sidebar.sections.catalog"),
      links: [
        { to: '/admin/products', icon: Package, label: t("admin.sidebar.products") },
        { to: '/admin/categories', icon: Grid, label: t("admin.sidebar.categories") },
        { to: '/admin/discounts', icon: Tag, label: t("admin.sidebar.discounts") },
      ],
    },
    {
      label: t("admin.sidebar.sections.sales"),
      links: [
        { to: '/admin/orders', icon: ShoppingBag, label: t("admin.sidebar.orders") },
      ],
    },
    {
      label: t("admin.sidebar.sections.customers"),
      links: [
        { to: '/admin/customers', icon: Users, label: t("admin.sidebar.customers") },
        { to: '/admin/reviews', icon: Star, label: t("admin.sidebar.reviews") },
      ],
    },
    ...(user?.role === 'admin' ? [
      {
        label: t("admin.sidebar.sections.system"),
        links: [
          { to: '/admin/sync-logs', icon: RefreshCw, label: t("admin.sidebar.syncLogs") },
          { to: '/admin/users', icon: Shield, label: t("admin.sidebar.users") },
        ],
      },
    ] : []),
  ];

  return (
    <div className="admin-shell flex min-h-screen bg-background">
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0 transition-[width] duration-300 ease-in-out hidden md:flex flex-col`}>
        <div className="h-16 border-b border-sidebar-border px-3 flex items-center">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={`group flex h-10 w-full items-center rounded-md transition-colors hover:bg-sidebar-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${collapsed ? 'justify-center px-0' : 'justify-start gap-2 px-1'}`}
            aria-label={collapsed ? t("admin.sidebar.brand") : t("nav.toggleMenu")}
            title={t("nav.toggleMenu")}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-display text-lg font-bold shadow-[0_6px_14px_rgba(0,0,0,0.14)] transition-transform duration-300 group-hover:scale-105">
              B
            </span>
            <span className={`${collapsed ? 'max-w-0 opacity-0' : 'max-w-32 opacity-100'} overflow-hidden whitespace-nowrap font-display text-lg font-bold text-sidebar-primary transition-[max-width,opacity] duration-300 ease-in-out`}>
              {t("admin.sidebar.brand")}
            </span>
          </button>
        </div>
        <nav className="flex-1 p-2">
          {sections.map(section => (
            <div key={section.label} className={collapsed ? 'space-y-1 py-1' : 'space-y-1 pb-3'}>
              <div className={`${collapsed ? 'my-2 mx-auto h-px w-8 bg-sidebar-border' : 'px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/40'}`}>
                {!collapsed && section.label}
              </div>
              {section.links.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) => `flex h-10 items-center rounded-md text-sm transition-colors duration-200 ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${isActive ? 'bg-sidebar-accent text-sidebar-primary font-medium' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'}`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className={`${collapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'} overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out`}>
                    {label}
                  </span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className={`flex h-10 items-center rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 w-full transition-colors duration-200 ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}
            title={collapsed ? t("common.signOut") : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            <span className={`${collapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'} overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out`}>
              {t("common.signOut")}
            </span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("admin.sidebar.title")}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
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
