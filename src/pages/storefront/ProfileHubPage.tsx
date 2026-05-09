import { Link, useNavigate } from "react-router-dom";
import { User, Package, MapPin, Heart, Shield, LogOut, ChevronRight, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/shared/store/authStore";
import { useTranslation } from "react-i18next";
import { PageMeta } from '@/lib/seo'

export function ProfileHubPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = [
    { to: '/profile/info',      icon: User,    label: t('profile.myInfo') },
    { to: '/profile/orders',    icon: Package, label: t('profile.myOrders') },
    { to: '/profile/addresses', icon: MapPin,  label: t('profile.myAddresses') },
    { to: '/profile/wishlist',  icon: Heart,   label: t('profile.wishlist') },
    ...(user?.role === 'admin' || user?.role === 'manager'
      ? [{ to: '/admin', icon: Shield, label: t('nav.adminPanel') }]
      : []),
  ];

  return (
    <div className="container max-w-lg mx-auto py-6 px-4 space-y-4 animate-fade-in">
      <PageMeta title="My Profile — Opto Vestor" pageType="private" />
      {/* User info card */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">

        {/* Avatar + name + email — links to profile/info */}
        <Link
          to="/profile/info"
          className="flex items-center gap-4 p-5 border-b border-border/50 hover:bg-muted/40 active:bg-muted/60 transition-colors"
        >
          <div className="w-[60px] h-[60px] rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <User size={28} className="text-accent/50" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-bold tracking-[-0.016em] text-foreground leading-snug">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[13px] text-muted-foreground tracking-[-0.006em] truncate mt-0.5">
              {user?.email || user?.phone}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <ShieldCheck size={12} className="text-accent" />
              <span className="text-[11px] font-semibold text-accent tracking-[-0.003em]">
                {t('profile.verified')}
              </span>
            </div>
          </div>

          <ChevronRight size={18} className="text-muted-foreground shrink-0" />
        </Link>

        {/* Nav items */}
        {menuItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 px-5 py-[15px] border-b border-border/50 hover:bg-muted/40 active:bg-muted/60 transition-colors"
          >
            <Icon size={20} className="text-muted-foreground shrink-0" />
            <span className="flex-1 text-[15px] font-medium tracking-[-0.011em] text-foreground">
              {label}
            </span>
            <ChevronRight size={16} className="text-muted-foreground/50 shrink-0" />
          </Link>
        ))}

        {/* Logout */}
        <button
          type="button"
          onClick={() => { void logout(); navigate('/'); }}
          className="flex items-center gap-4 px-5 py-[15px] w-full hover:bg-muted/40 active:bg-muted/60 transition-colors"
        >
          <LogOut size={20} className="text-destructive shrink-0" />
          <span className="flex-1 text-left text-[15px] font-medium tracking-[-0.011em] text-destructive">
            {t('common.signOut')}
          </span>
          <ChevronRight size={16} className="text-muted-foreground/50 shrink-0" />
        </button>
      </div>
    </div>
  );
}
