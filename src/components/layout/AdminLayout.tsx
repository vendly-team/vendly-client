import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import { LayoutDashboard, Package, Grid, ShoppingBag, Users, Star, Tag, RefreshCw, Shield, LogOut, Menu, X, ChevronDown, Store } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useAppEnvironment } from "@/hooks/useAppEnvironment";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminLayout = () => {
  const { t } = useTranslation();
  const { isTelegram, isIos } = useAppEnvironment();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  type SidebarLink = {
    to: string;
    icon: LucideIcon;
    label: string;
    end?: boolean;
  };

  const sections: Array<{ label: string; links: SidebarLink[] }> = [
    {
      label: t(""),
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

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 overflow-y-auto p-2 bg-card">
      {sections.map(section => (
        <div key={section.label} className={collapsed ? 'space-y-1 py-1' : 'space-y-1 pb-3'}>
          <div className={`${collapsed ? 'my-2 mx-auto h-px w-8 bg-sidebar-border' : 'px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-sidebar-foreground/40'}`}>
            {!collapsed && section.label}
          </div>
          {section.links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              onClick={onNavigate}
              className={({ isActive }) => `flex h-10 items-center rounded-lg text-[14px] font-medium tracking-[-0.011em] transition-colors duration-200 ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${isActive ? 'bg-sidebar-primary/10 text-sidebar-primary font-semibold' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'}`}
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
  );

  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  return (
    /* h-screen + overflow-hidden → only <main> scrolls, layout stays fixed */
    <div className="admin-shell flex h-screen overflow-hidden bg-background">

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 ease-[cubic-bezier(0.28,0.11,0.32,1)] md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`shrink-0 border-b border-sidebar-border px-4 flex items-center justify-between ${isTelegram && isIos ? 'pt-24 h-auto' : 'h-16'}`}>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-display text-[18px] font-bold tracking-[-0.018em] shadow-[0_6px_14px_rgba(0,0,0,0.14)]">
              B
            </span>
            <span className="font-display text-[18px] font-bold tracking-[-0.018em] text-sidebar-primary">
              {t("admin.sidebar.brand")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-sidebar-accent/50 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarNav onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0 transition-[width] duration-300 ease-in-out hidden md:flex flex-col`}>
        <div className={`shrink-0 border-b border-sidebar-border px-3 flex bg-card items-center ${isTelegram && isIos ? 'pt-24 h-auto' : 'h-16'}`}>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={`group flex h-10 w-full items-center rounded-md transition-colors hover:bg-sidebar-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${collapsed ? 'justify-center px-0' : 'justify-start gap-2 px-1'}`}
            aria-label={collapsed ? t("admin.sidebar.brand") : t("nav.toggleMenu")}
            title={t("nav.toggleMenu")}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-display text-[18px] font-bold tracking-[-0.018em] shadow-[0_6px_14px_rgba(0,0,0,0.14)] transition-transform duration-300 group-hover:scale-105">
              B
            </span>
            <span className={`${collapsed ? 'max-w-0 opacity-0' : 'max-w-32 opacity-100'} overflow-hidden whitespace-nowrap font-display text-[18px] font-bold tracking-[-0.018em] text-sidebar-primary transition-[max-width,opacity] duration-300 ease-in-out`}>
              {t("admin.sidebar.brand")}
            </span>
          </button>
        </div>
        <SidebarNav />
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Sticky header */}
        <header className={`shrink-0 bg-card border-b border-border flex items-center justify-between px-4 ${isTelegram && isIos ? 'pt-24 h-auto' : 'h-16'}`}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-accent/10 transition-colors md:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <span className="text-[13px] font-medium tracking-[-0.006em] text-muted-foreground">{t("admin.sidebar.title")}</span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 h-9 px-2.5 rounded-xl hover:bg-accent/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {/* Avatar */}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-[12px] font-semibold tracking-[-0.005em]">
                    {initials}
                  </span>
                  <span className="text-[14px] font-medium tracking-[-0.011em] text-foreground hidden sm:block">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-[12px] font-semibold tracking-[-0.005em]">
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium tracking-[-0.011em] text-foreground truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <span className={`inline-flex items-center text-[11px] font-semibold tracking-[-0.005em] px-1.5 py-0.5 rounded ${user?.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-info/10 text-info'}`}>
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer text-[14px] font-medium tracking-[-0.006em]"
                  onClick={() => navigate('/')}
                >
                  <Store size={15} className="mr-2" />
                  {t("admin.sidebar.userSide")}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-[14px] font-medium tracking-[-0.006em]"
                  onClick={() => { logout(); navigate('/'); }}
                >
                  <LogOut size={15} className="mr-2" />
                  {t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scrollable content — only this scrolls */}
        <main className="flex-1 overflow-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
