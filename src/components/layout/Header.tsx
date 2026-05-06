import { Link } from "react-router-dom";
import { Search, ShoppingCart, User, Heart, X, ChevronDown, LogOut, Package, Shield, Globe, Loader2 } from "lucide-react";
import { OptoLogo } from "@/components/ui/OptoLogo";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { categoriesApi, mapCategoryDto } from "@/shared/api/categoriesApi";
import type { Category } from "@/shared/types";
import { useCartStore } from "@/shared/store/cartStore";
import { useAuthStore } from "@/shared/store/authStore";
import { useTranslation } from "react-i18next";
import { languages } from "@/lib/i18n";
import { useAppEnvironment } from "@/hooks/useAppEnvironment";
import { useProductSearch } from "@/features/products/hooks/useProductSearch";
import { PRODUCT_SEARCH_MIN_LENGTH } from "@/features/products/types";
import { SearchSuggestionsPanel } from "@/components/storefront/SearchSuggestionsPanel";

const LANG_LABELS: Record<string, string> = {
  en: 'EN',
  ru: 'RU',
  uz: "O'Z",
  'uz-Cyrl': 'ЎЗ',
};

const MAX_SUGGESTIONS = 6;

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
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmedQuery = searchQuery.trim();
  const { results: searchResults, loading: searchLoading, error: searchError } =
    useProductSearch(trimmedQuery);
  const hasMinChars = trimmedQuery.length >= PRODUCT_SEARCH_MIN_LENGTH;
  const showDesktopSuggestions = searchOpen && searchSuggestionsOpen && hasMinChars;
  const showMobileSuggestions = mobileSearchOpen && hasMinChars;
  const visibleResults = searchResults.slice(0, MAX_SUGGESTIONS);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [trimmedQuery]);

  // Close handlers
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (mobileLangRef.current && !mobileLangRef.current.contains(e.target as Node)) setMobileLangOpen(false);
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) {
        setSearchSuggestionsOpen(false);
      }
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

  // Lock body scroll while desktop spotlight is open
  useEffect(() => {
    if (!showDesktopSuggestions) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [showDesktopSuggestions]);

  const closeAllSearch = useCallback(() => {
    setSearchSuggestionsOpen(false);
    setMobileSearchOpen(false);
    searchInputRef.current?.blur();
    mobileSearchInputRef.current?.blur();
  }, []);

  const closeAfterNavigate = useCallback(() => {
    setSearchSuggestionsOpen(false);
    setMobileSearchOpen(false);
    setSearchQuery('');
    setActiveIndex(-1);
  }, []);

  const goToSearchPage = useCallback(() => {
    if (!hasMinChars) return;
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    closeAfterNavigate();
  }, [hasMinChars, navigate, trimmedQuery, closeAfterNavigate]);

  // Global Esc to close
  useEffect(() => {
    if (!showDesktopSuggestions && !showMobileSuggestions) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAllSearch();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showDesktopSuggestions, showMobileSuggestions, closeAllSearch]);

  // Keyboard navigation in input (Arrow Up/Down/Enter)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!hasMinChars || visibleResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % visibleResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? visibleResults.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < visibleResults.length) {
        e.preventDefault();
        const target = visibleResults[activeIndex];
        const url = target.redirectUrl;
        if (url) {
          const path = url.startsWith('http')
            ? new URL(url).pathname + new URL(url).search
            : url;
          navigate(path);
          closeAfterNavigate();
        }
      }
      // Otherwise let the form submit handler navigate to /search?q=
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    if (isDesktop && !searchOpen) { setSearchOpen(true); return; }
    if (hasMinChars) goToSearchPage();
  };

  const handleDesktopSearchBlur = () => {
    window.setTimeout(() => {
      if (!searchInputRef.current?.value.trim() && !searchSuggestionsOpen) {
        setSearchOpen(false);
      }
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
    <>
      {/* Spotlight backdrop — dims rest of page when desktop dropdown is open */}
      <div
        aria-hidden={!showDesktopSuggestions}
        onClick={closeAllSearch}
        className={`hidden md:block fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[2px] transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          showDesktopSuggestions ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

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
          <div ref={desktopSearchRef} className="relative">
            <form
              onSubmit={handleSearch}
              role="search"
              className={`relative h-10 shrink-0 overflow-hidden rounded-full border bg-background transition-[width,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${searchOpen ? 'w-[min(40vw,28rem)] border-accent/60 shadow-[0_4px_24px_rgba(0,0,0,0.08)]' : 'w-10 border-transparent hover:border-border'} ${showDesktopSuggestions ? 'ring-2 ring-accent/30' : ''}`}
            >
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t("header.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchSuggestionsOpen(true); }}
                onFocus={() => { setSearchOpen(true); setSearchSuggestionsOpen(true); }}
                onBlur={handleDesktopSearchBlur}
                onKeyDown={handleSearchKeyDown}
                role="combobox"
                aria-expanded={showDesktopSuggestions}
                aria-autocomplete="list"
                aria-controls="search-suggestions-desktop"
                aria-activedescendant={activeIndex >= 0 ? `suggestion-${visibleResults[activeIndex]?.id}` : undefined}
                className={`h-full w-full bg-transparent pl-4 pr-10 text-[14px] font-normal tracking-[-0.011em] text-foreground placeholder:text-muted-foreground outline-none transition-opacity duration-200 ${searchOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
              />
              <button
                type="submit"
                className={`absolute right-0 top-0 grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:text-accent ${searchOpen ? '' : 'search-icon-shake'}`}
                aria-label="Search"
              >
                {searchLoading && hasMinChars
                  ? <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  : <Search size={18} aria-hidden="true" />}
              </button>
            </form>

            {/* Suggestions dropdown — animated */}
            <div
              id="search-suggestions-desktop"
              className={`absolute right-0 top-full mt-2 w-[min(40vw,28rem)] z-50 origin-top transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                showDesktopSuggestions
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                  : 'opacity-0 -translate-y-2 scale-[0.98] pointer-events-none'
              }`}
            >
              <div className="bg-card border border-border rounded-xl shadow-[0_16px_48px_-8px_rgba(0,0,0,0.18)] max-h-[70vh] overflow-y-auto">
                <SearchSuggestionsPanel
                  query={trimmedQuery}
                  results={searchResults}
                  loading={searchLoading}
                  error={searchError}
                  activeIndex={activeIndex}
                  onHover={setActiveIndex}
                  onNavigate={closeAfterNavigate}
                  onViewAll={goToSearchPage}
                  maxItems={MAX_SUGGESTIONS}
                />
              </div>
            </div>
          </div>

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
          <form onSubmit={handleSearch} role="search" className="px-4 pb-3 pt-1">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                placeholder={t("header.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                role="combobox"
                aria-expanded={showMobileSuggestions}
                aria-autocomplete="list"
                aria-controls="search-suggestions-mobile"
                className="w-full h-10 pl-9 pr-9 rounded-full border border-border bg-background text-[14px] font-normal tracking-[-0.011em] text-foreground placeholder:text-muted-foreground glass-input"
              />
              {searchLoading && hasMinChars && (
                <Loader2
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin pointer-events-none"
                />
              )}
              {!searchLoading && searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label={t('common.clear', { defaultValue: 'Clear' })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </form>

          <div
            id="search-suggestions-mobile"
            className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              showMobileSuggestions ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="border-t border-border bg-card max-h-[60vh] overflow-y-auto">
              <SearchSuggestionsPanel
                query={trimmedQuery}
                results={searchResults}
                loading={searchLoading}
                error={searchError}
                activeIndex={activeIndex}
                onHover={setActiveIndex}
                onNavigate={closeAfterNavigate}
                onViewAll={goToSearchPage}
                maxItems={MAX_SUGGESTIONS}
              />
            </div>
          </div>
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
    </>
  );
};

export default Header;
