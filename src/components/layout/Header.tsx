import { Link } from "react-router-dom";
import { Search, ShoppingCart, User, Heart, X, ChevronDown, LogOut, Package, Shield, Globe } from "lucide-react";
import { OptoLogo } from "@/components/ui/OptoLogo";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categoriesApi, mapCategoryDto } from "@/shared/api/categoriesApi";
import type { Category } from "@/shared/types";
import { useCartStore } from "@/shared/store/cartStore";
import { useAuthStore } from "@/shared/store/authStore";
import { useTranslation } from "react-i18next";
import { languages } from "@/lib/i18n";
import { useAppEnvironment } from "@/hooks/useAppEnvironment";

const LANG_LABELS: Record<string, string> = {
  en: 'EN',
  ru: 'RU',
  uz: "O'Z",
  'uz-Cyrl': 'ЎЗ',
};

const Header = () => {
  const { t, i18n } = useTranslation();
  const { isTelegram, isIos, isAndroid } = useAppEnvironment();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [showCategoryNav, setShowCategoryNav] = useState(false);
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const { user, isAuthenticated, logout } = useAuthStore();
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (mobileLangRef.current && !mobileLangRef.current.contains(e.target as Node)) setMobileLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const items = await categoriesApi.getAll();
        setCategories(items.map(mapCategoryDto).filter(c => c.isActive));
      } catch {
        setCategories([]);
      }
    };
    void loadCategories();
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
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { if (searchOpen) searchInputRef.current?.focus(); }, [searchOpen]);
  useEffect(() => { if (mobileSearchOpen) mobileSearchInputRef.current?.focus(); }, [mobileSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    if (isDesktop && !searchOpen) { setSearchOpen(true); return; }
    if (searchQuery.trim().length >= 4) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleDesktopSearchBlur = () => {
    window.setTimeout(() => {
      if (!searchInputRef.current?.value.trim()) setSearchOpen(false);
    }, 120);
  };

  const LangSegmented = ({ onSelect }: { onSelect?: () => void }) => (
    <div className="px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1.5">
        {t('common.language')}
      </p>
      <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-black/[0.05]">
        {languages.map(lang => {
          const isActive = i18n.language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => { void i18n.changeLanguage(lang.code); onSelect?.(); }}
              className={`flex-1 py-1 text-[11px] tracking-[-0.003em] rounded-full transition-all duration-200 ease-out ${isActive
                ? 'bg-white text-foreground font-semibold shadow-sm'
                : 'bg-transparent text-muted-foreground font-medium hover:text-foreground'
                }`}
            >
              {LANG_LABELS[lang.code] ?? lang.code.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${isTelegram && isIos ? 'pt-24' : isTelegram && isAndroid ? 'pt-16' : ''} ${scrolled ? 'bg-background/70 backdrop-blur-xl backdrop-saturate-150 border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'bg-card border-border'}`}>
      <div className="container flex items-center gap-4 py-3">

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <OptoLogo />
        </Link>

        {/* ── Mobile icon row ───────────────────────────── */}
        <div className="flex items-center gap-1 ml-auto md:hidden">
          {/* Search toggle */}
          <button
            type="button"
            className="p-2 text-foreground hover:text-accent transition-colors"
            onClick={() => setMobileSearchOpen(v => !v)}
            aria-label="Search"
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Favourites */}
          <Link to="/profile/wishlist" className="p-2 text-foreground hover:text-accent transition-colors">
            <Heart size={20} />
          </Link>

          {/* Language dropdown */}
          <div className="relative" ref={mobileLangRef}>
            <button
              type="button"
              onClick={() => setMobileLangOpen(v => !v)}
              className="flex items-center gap-1 p-2 text-foreground hover:text-accent transition-colors"
              aria-label="Language"
            >
              <Globe size={20} />
              <span className="text-[11px] font-semibold tracking-[-0.003em]">
                {LANG_LABELS[i18n.language] ?? i18n.language.toUpperCase()}
              </span>
            </button>
            {mobileLangOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-lg z-50 animate-fade-in">
                <LangSegmented onSelect={() => setMobileLangOpen(false)} />
              </div>
            )}
          </div>
        </div>

        {/* ── Desktop icon row ──────────────────────────── */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          {/* Expanding search */}
          <form
            onSubmit={handleSearch}
            className={`relative h-10 shrink-0 overflow-hidden rounded-full border bg-background transition-[width,border-color,box-shadow] duration-500 ease-out ${searchOpen ? 'w-[min(34vw,22rem)] border-accent/60 shadow-sm' : 'w-10 border-transparent hover:border-border'}`}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t("header.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={handleDesktopSearchBlur}
              className={`h-full w-full bg-transparent pl-4 pr-10 text-[14px] font-normal tracking-[-0.011em] text-foreground placeholder:text-muted-foreground outline-none transition-opacity duration-200 ${searchOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            />
            <button
              type="submit"
              className={`absolute right-0 top-0 grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:text-accent ${searchOpen ? '' : 'search-icon-shake'}`}
              aria-label="Search"
            >
              <Search size={18} aria-hidden="true" />
            </button>
          </form>

          <Link to="/profile/wishlist" className="p-2 text-foreground hover:text-accent transition-colors">
            <Heart size={20} />
          </Link>

          <Link to="/cart" className="p-2 text-foreground hover:text-accent transition-colors relative">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-accent text-accent-foreground text-[10px] font-bold tracking-[-0.005em] flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="p-2 text-foreground hover:text-accent transition-colors flex items-center gap-1"
            >
              <User size={20} />
              {isAuthenticated && (
                <>
                  <span className="text-[14px] font-medium tracking-[-0.011em]">{user?.firstName}</span>
                  <ChevronDown size={14} />
                </>
              )}
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-lg shadow-lg py-1 z-50 animate-fade-in">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile/info" className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium tracking-[-0.006em] text-foreground hover:bg-muted" onClick={() => setProfileOpen(false)}><User size={16} /> {t("nav.profile")}</Link>
                    <Link to="/profile/orders" className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium tracking-[-0.006em] text-foreground hover:bg-muted" onClick={() => setProfileOpen(false)}><Package size={16} /> {t("nav.myOrders")}</Link>
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium tracking-[-0.006em] text-foreground hover:bg-muted" onClick={() => setProfileOpen(false)}><Shield size={16} /> {t("nav.adminPanel")}</Link>
                    )}
                    <hr className="my-1 border-border" />
                    <LangSegmented onSelect={() => setProfileOpen(false)} />
                    <hr className="my-1 border-border" />
                    <button onClick={() => { logout(); setProfileOpen(false); navigate('/'); }} className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium tracking-[-0.006em] text-destructive hover:bg-muted w-full">
                      <LogOut size={16} /> {t("common.signOut")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium tracking-[-0.006em] text-foreground hover:bg-muted" onClick={() => setProfileOpen(false)}><User size={16} /> {t("nav.signIn", { defaultValue: 'Sign in' })}</Link>
                    <hr className="my-1 border-border" />
                    <LangSegmented onSelect={() => setProfileOpen(false)} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search dropdown */}
      <div className={`grid md:hidden transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileSearchOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <form onSubmit={handleSearch} className="px-4 pb-3 pt-1">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                placeholder={t("header.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-full border border-border bg-background text-[14px] font-normal tracking-[-0.011em] text-foreground placeholder:text-muted-foreground glass-input"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Desktop category nav */}
      <nav
        className={`hidden md:grid border-t transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${showCategoryNav ? 'grid-rows-[1fr] opacity-100 border-border/50' : 'grid-rows-[0fr] opacity-0 border-transparent'
          }`}
      >
        <div className="overflow-hidden">
          <div className={`container flex items-center gap-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${showCategoryNav ? 'py-2 translate-y-0' : 'py-0 -translate-y-2'} overflow-x-auto`}>
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`text-[14px] tracking-[-0.011em] text-foreground/80 hover:text-accent whitespace-nowrap font-medium transition-all duration-500 ${showCategoryNav ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
                style={{ transitionDelay: showCategoryNav ? `${i * 30}ms` : '0ms' }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
