import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Search, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/shared/store/cartStore";
import { useTranslation } from "react-i18next";

const MobileBottomNav = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));

  const items = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/category/refrigerators", icon: LayoutGrid, label: t("nav.catalog") },
    { to: "/search", icon: Search, label: t("nav.search") },
    { to: "/cart", icon: ShoppingCart, label: t("nav.cart"), badge: totalItems },
    { to: "/login", icon: User, label: t("nav.profile") },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around py-1.5">
        {items.map(({ to, icon: Icon, label, badge }) => {
          const active = pathname === to;
          return (
            <Link key={to} to={to} className={`flex flex-col items-center gap-0.5 py-1 px-3 text-[10px] font-medium transition-colors relative ${active ? "text-accent" : "text-muted-foreground"}`}>
              <Icon size={20} />
              {badge ? <span className="absolute top-0 right-1.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">{badge}</span> : null}
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
