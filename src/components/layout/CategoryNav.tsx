import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import type { Category, Product } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { productService } from '@/features/products/services/productService';
import { mapProductCardToStorefrontProduct } from '@/features/products/services/storefrontProductMapper';
import { useI18nLanguage } from '@/hooks/useI18nLanguage';
import ProductCard from '@/components/storefront/ProductCard';

export type CategoryNavHandle = {
  togglePanel: () => void;
};

type Props = {
  categories: Category[];
  show: boolean;
  onPanelChange?: (open: boolean) => void;
};

const MORE_BTN_W = 96;
const GAP = 24;

export const CategoryNav = forwardRef<CategoryNavHandle, Props>(function CategoryNav({ categories, show, onPanelChange }, ref) {
  const { t } = useTranslation();
  const language = useI18nLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(categories.length);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  const [panelLeft, setPanelLeft] = useState(0);
  const [panelWidth, setPanelWidth] = useState(0);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Measure how many categories fit in one row
  const recalc = useCallback(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    const containerW = container.offsetWidth;
    const items = Array.from(measure.children) as HTMLElement[];
    let used = 0;
    let count = 0;
    for (let i = 0; i < items.length; i++) {
      const w = items[i].offsetWidth;
      const withGap = i === 0 ? w : w + GAP;
      const hasNext = i + 1 < items.length;
      if (used + withGap + (hasNext ? MORE_BTN_W : 0) > containerW) break;
      used += withGap;
      count++;
    }
    setVisibleCount(count);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(recalc);
    ro.observe(container);
    recalc();
    return () => ro.disconnect();
  }, [recalc]);

  useEffect(() => { recalc(); }, [categories, recalc]);

  // Measure header bottom to position panel correctly
  const measurePanelTop = useCallback(() => {
    const header = document.querySelector('header');
    if (header) setPanelTop(header.getBoundingClientRect().bottom);
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      setPanelLeft(rect.left);
      setPanelWidth(rect.width);
    }
  }, []);

  // Fetch products when active category changes
  useEffect(() => {
    if (!activeCategory) { setProducts([]); return; }
    setLoadingProducts(true);
    setProducts([]);
    productService
      .getAll({ categoryId: Number(activeCategory.id), page: 1, pageSize: 8 })
      .then((page) => setProducts(page.items.map(mapProductCardToStorefrontProduct)))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [activeCategory, language]);

  // Close panel on outside click
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insidePanel = panelRef.current?.contains(target);
      const insideMore = moreRef.current?.contains(target);
      if (!insidePanel && !insideMore) {
        setPanelOpen(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [panelOpen]);

  // Lock body scroll while panel is open
  useEffect(() => {
    if (!panelOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [panelOpen]);

  const closePanel = () => {
    setPanelOpen(false);
    setActiveCategory(null);
  };

  const handleMoreClick = () => {
    if (panelOpen) { closePanel(); return; }
    measurePanelTop();
    setPanelOpen(true);
    if (categories.length > 0) setActiveCategory(categories[0]);
  };

  useImperativeHandle(ref, () => ({ togglePanel: handleMoreClick }));

  useEffect(() => { onPanelChange?.(panelOpen); }, [panelOpen, onPanelChange]);

  const visible = categories.slice(0, visibleCount);
  const hidden = categories.slice(visibleCount);

  return (
    <>
      {/* ── Category row ── */}
      <nav
        className={`hidden md:grid border-t transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${
          show
            ? 'grid-rows-[1fr] opacity-100 border-border/50'
            : 'grid-rows-[0fr] opacity-0 border-transparent'
        }`}
      >
        <div className="overflow-hidden">
          {/* Invisible measurement row */}
          <div
            ref={measureRef}
            aria-hidden
            className="absolute invisible pointer-events-none flex items-center gap-6"
            style={{ top: -9999 }}
          >
            {categories.map((cat) => (
              <span key={cat.id} className="text-[14px] font-medium whitespace-nowrap">
                {cat.name}
              </span>
            ))}
          </div>

          {/* Visible links + Yana button */}
          <div
            ref={containerRef}
            className={`container flex items-center gap-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              show ? 'py-2 translate-y-0' : 'py-0 -translate-y-2'
            }`}
          >
            {visible.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`text-[14px] tracking-[-0.011em] text-foreground/80 hover:text-accent whitespace-nowrap font-medium transition-all duration-500 ${
                  show ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                }`}
                style={{ transitionDelay: show ? `${i * 30}ms` : '0ms' }}
              >
                {cat.name}
              </Link>
            ))}

            {hidden.length > 0 && (
              <div ref={moreRef} className="ml-auto shrink-0">
                <button
                  onClick={handleMoreClick}
                  className={`flex items-center gap-1.5 text-[14px] font-medium tracking-[-0.011em] transition-all duration-300 whitespace-nowrap px-3 py-1.5 rounded-lg ${
                    panelOpen
                      ? 'bg-accent/10 text-accent'
                      : 'text-foreground/70 hover:text-accent hover:bg-muted'
                  } ${show ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
                  style={{ transitionDelay: show ? `${visible.length * 30}ms` : '0ms' }}
                >
                  {t('nav.more', { defaultValue: 'Yana' })}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${panelOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Full-screen mega panel (via portal to escape header backdrop-filter) ── */}
      {hidden.length > 0 && createPortal(
        <>
          {/* Backdrop */}
          <div
            aria-hidden
            onClick={closePanel}
            className={`fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px] transition-opacity duration-300 ${
              panelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* Panel */}
          <div
            ref={panelRef}
            className={`fixed z-40 flex shadow-2xl rounded-b-xl overflow-hidden border border-border transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              panelOpen
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
            style={{
              top: panelTop,
              left: panelLeft,
              width: panelWidth,
              height: `calc(100vh - ${panelTop}px)`,
            }}
          >
            {/* Left: category list */}
            <div className="w-60 shrink-0 bg-card border-r border-border flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {t('nav.categories', { defaultValue: 'Kategoriyalar' })}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onMouseEnter={() => setActiveCategory(cat)}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      activeCategory?.id === cat.id
                        ? 'bg-accent/10 text-accent'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt=""
                        loading="lazy"
                        className="w-8 h-8 shrink-0 rounded-md object-cover bg-muted"
                      />
                    ) : (
                      <span className="w-8 h-8 shrink-0 rounded-md bg-muted" />
                    )}
                    <span className="flex-1 text-[14px] font-medium tracking-[-0.006em] truncate">
                      {cat.name}
                    </span>
                    <ChevronRight size={14} className="shrink-0 opacity-40" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: products board */}
            <div className="flex-1 bg-background overflow-y-auto">
              {activeCategory ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[18px] font-bold tracking-[-0.016em] text-foreground">
                      {activeCategory.name}
                    </h2>
                    <Link
                      to={`/category/${activeCategory.slug}`}
                      onClick={closePanel}
                      className="flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:underline"
                    >
                      {t('common.viewAll', { defaultValue: "Barchasini ko'rish" })}
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  {loadingProducts ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="rounded-2xl bg-muted animate-pulse aspect-[3/4]" />
                      ))}
                    </div>
                  ) : products.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground text-[14px]">
                      {t('common.noProducts', { defaultValue: "Mahsulotlar yo'q" })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" onClick={closePanel}>
                      {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-[14px]">
                  {t('nav.selectCategory', { defaultValue: 'Kategoriya tanlang' })}
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
});
