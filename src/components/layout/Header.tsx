import { Link } from "react-router-dom";
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronDown, LogOut, Package } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categories } from "@/shared/data/categories";
import { useCartStore } from "@/shared/store/cartStore";
import { useAuthStore } from "@/shared/store/authStore";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

const Header = () => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showCategoryNav, setShowCategoryNav] = useState(false);
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const { user, isAuthenticated, logout } = useAuthStore();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = document.getElementById('category-grid-section');
    if (!el) { setShowCategoryNav(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => setShowCategoryNav(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${scrolled ? 'bg-background/70 backdrop-blur-xl backdrop-saturate-150 border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'bg-card border-border'}`}>
      <div className="bg-primary">
        <div className="container flex items-center justify-between py-1.5 text-xs text-primary-foreground/80">
          <span>{t("header.freeShipping")}</span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">📞 {t("header.phone")}</span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="container flex items-center gap-4 py-3">
        <button className="md:hidden p-1.5 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={t("nav.toggleMenu")}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-display font-bold text-lg">B</span>
          </div>
          <span className="font-display font-bold text-xl text-foreground hidden sm:inline">{t("header.brand")}</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <input type="text" placeholder={t("header.searchPlaceholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-4 pr-10 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Search size={18} /></button>
          </div>
        </form>

        <div className="flex items-center gap-1 ml-auto">
          <button className="md:hidden p-2 text-foreground hover:text-accent transition-colors" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            <Search size={20} />
          </button>
          <Link to="/profile/wishlist" className="p-2 text-foreground hover:text-accent transition-colors hidden sm:flex"><Heart size={20} /></Link>
          <Link to="/cart" className="p-2 text-foreground hover:text-accent transition-colors relative">
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">{totalItems}</span>}
          </Link>

          <div className="relative" ref={profileRef}>
            {isAuthenticated ? (
              <>
                <button onClick={() => setProfileOpen(!profileOpen)} className="p-2 text-foreground hover:text-accent transition-colors flex items-center gap-1">
                  <User size={20} />
                  <span className="hidden md:inline text-sm">{user?.firstName}</span>
                  <ChevronDown size={14} className="hidden md:inline" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50 animate-fade-in">
                    <Link to="/profile/info" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => setProfileOpen(false)}><User size={16} /> {t("nav.profile")}</Link>
                    <Link to="/profile/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => setProfileOpen(false)}><Package size={16} /> {t("nav.myOrders")}</Link>
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => setProfileOpen(false)}>🛡️ {t("nav.adminPanel")}</Link>
                    )}
                    <hr className="my-1 border-border" />
                    <button onClick={() => { logout(); setProfileOpen(false); navigate('/'); }} className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted w-full"><LogOut size={16} /> {t("common.signOut")}</button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="p-2 text-foreground hover:text-accent transition-colors"><User size={20} /></Link>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={handleSearch} className="md:hidden px-4 pb-3">
          <div className="relative">
            <input type="text" placeholder={t("header.searchPlaceholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 pl-4 pr-10 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50" autoFocus />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Search size={18} /></button>
          </div>
        </form>
      )}

      <nav
        className={`hidden md:grid border-t transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${
          showCategoryNav
            ? 'grid-rows-[1fr] opacity-100 border-border/50'
            : 'grid-rows-[0fr] opacity-0 border-transparent'
        }`}
      >
        <div className="overflow-hidden">
          <div className={`container flex items-center gap-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            showCategoryNav ? 'py-2 translate-y-0' : 'py-0 -translate-y-2'
          } overflow-x-auto`}>
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`text-sm text-foreground/80 hover:text-accent whitespace-nowrap font-medium transition-all duration-500 ${
                  showCategoryNav
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-3 opacity-0'
                }`}
                style={{ transitionDelay: showCategoryNav ? `${i * 30}ms` : '0ms' }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-card border-b border-border shadow-lg animate-fade-in z-40">
          <nav className="container py-4 space-y-1">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="block py-2.5 px-3 text-sm text-foreground hover:bg-muted rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
