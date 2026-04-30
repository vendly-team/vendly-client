import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useAuthStore } from '@/shared/store/authStore';
import { User, Package, MapPin, Heart, LogOut } from 'lucide-react';
import { useTranslation } from "react-i18next";

const ProfileLayout = () => {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const links = [
    { to: '/profile/info', icon: User, label: t("profile.myInfo") },
    { to: '/profile/orders', icon: Package, label: t("profile.myOrders") },
    { to: '/profile/addresses', icon: MapPin, label: t("profile.myAddresses") },
    { to: '/profile/wishlist', icon: Heart, label: t("profile.wishlist") },
  ];

  return (
    <StorefrontLayout>
      <div className="container py-6 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="hidden md:block md:w-56 shrink-0">
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible bg-card border border-border rounded-lg p-2">
              {links.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md text-[14px] tracking-[-0.011em] whitespace-nowrap transition-colors ${isActive ? 'bg-accent text-accent-foreground font-semibold' : 'text-foreground font-medium hover:bg-muted'}`}>
                  <Icon size={16} /> {label}
                </NavLink>
              ))}
              <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-3 py-2 rounded-md text-[14px] font-medium tracking-[-0.011em] text-destructive hover:bg-muted">
                <LogOut size={16} /> {t("common.signOut")}
              </button>
            </nav>
          </aside>
          <main className="flex-1"><Outlet /></main>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default ProfileLayout;
