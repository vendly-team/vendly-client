import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/shared/store/cartStore";
import { useTranslation } from "react-i18next";

const MobileBottomNav = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));

  const items = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/category/refrigerators", icon: LayoutGrid, label: t("nav.catalog") },
    { to: "/cart", icon: ShoppingCart, label: t("nav.cart"), badge: totalItems },
    { to: "/profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4"
      style={{ paddingBottom: "calc(12px + var(--app-safe-area-bottom, env(safe-area-inset-bottom, 0px)))" }}
    >
      <div className="inline-flex items-center gap-1 select-none p-1 rounded-full border border-white/60 dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]">
        {items.map(({ to, icon: Icon, label, badge }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex flex-col items-center gap-0.5 py-2.5 px-6 rounded-full text-[10px] font-semibold tracking-[-0.003em] transition-all duration-200 ${
                active ? "text-accent bg-accent/10" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {badge ? (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent text-accent-foreground text-[9px] font-bold tracking-[-0.005em] flex items-center justify-center">
                    {badge}
                  </span>
                ) : null}
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
