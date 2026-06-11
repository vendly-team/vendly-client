import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useI18nLanguage } from '@/hooks/useI18nLanguage';
import { useProductPlaceholder } from '@/hooks/useProductPlaceholder';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { PageMeta } from '@/lib/seo'
import { trackViewItem, trackAddToCart } from '@/lib/analytics'
import type { GA4Item } from '@/lib/analytics'
import ProductCard from '@/components/storefront/ProductCard';
import { useCartStore } from '@/shared/store/cartStore';
import { useWishlistToggle } from '@/features/wishlist/hooks/useWishlistToggle';
import { formatPrice } from '@/shared/utils';
import { Heart, ImagePlus, Minus, Plus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '@/features/products/services/productService';
import type { ProductAdminDetailResponse, ProductVariantResponse } from '@/features/products/types';
import {
  getDisplayVariants,
  getProductIdFromSlug,
  getVariantImages,
  mapProductCardToStorefrontProduct,
  mapProductDetailToStorefrontProduct,
  resolveProductMediaUrl,
} from '@/features/products/services/storefrontProductMapper';
import { createCategorySlug } from '@/shared/api/categoriesApi';
import { trackProductView } from '@/features/recently-viewed/lib/trackProductView';
import RecentlyViewedSection from '@/components/storefront/RecentlyViewedSection';
import type { Product } from '@/shared/types';

const ProductPage = () => {
  const { t } = useTranslation();
  const placeholder = useProductPlaceholder();
  const { slug } = useParams();
  const language = useI18nLanguage();
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const { toggle, isWishlisted: checkWishlisted } = useWishlistToggle();
  const [product, setProduct] = useState<ProductAdminDetailResponse | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [mainImage, setMainImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [tab, setTab] = useState<'description' | 'variants'>('description');

  const productId = getProductIdFromSlug(slug);
  const storeProduct = product ? mapProductDetailToStorefrontProduct(product) : null;
  const isWishlisted = storeProduct ? checkWishlisted(storeProduct.id) : false;

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setProduct(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const detail = await productService.getById(productId);
        setProduct(detail);
        const firstVariant = getDisplayVariants(detail)[0];
        setSelectedOptions(Object.fromEntries(firstVariant?.combination.map(item => [item.optionId, item.optionId]) ?? []));

        const page = await productService.getAll({ categoryId: detail.categoryId, pageSize: 5 });
        const related = page.items
          .filter(item => item.id !== detail.id)
          .slice(0, 4)
          .map(mapProductCardToStorefrontProduct);
        setRelatedProducts(related);
      } catch {
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [productId, language]);

  useEffect(() => {
    if (product?.id) trackProductView(product.id);
  }, [product?.id]);

  useEffect(() => {
    if (!storeProduct) return
    const ga4Item: GA4Item = {
      item_id: String(storeProduct.id),
      item_name: storeProduct.name,
      item_category: storeProduct.category,
      price: storeProduct.salePrice ?? storeProduct.price,
      quantity: 1,
    }
    trackViewItem(ga4Item)
  }, [storeProduct?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedVariant = useMemo<ProductVariantResponse | null>(() => {
    if (!product) return null;
    const variants = getDisplayVariants(product);
    return variants.find(variant => variant.combination.every(item => selectedOptions[item.optionId] === item.optionId)) ?? variants[0] ?? null;
  }, [product, selectedOptions]);

  const cartProductId = product && selectedVariant ? `${product.id}:${selectedVariant.id}` : '';

  const images = useMemo(() => {
    if (!product) return [];
    const selectedImages = selectedVariant ? getVariantImages([selectedVariant]) : [];
    const allImages = getVariantImages(getDisplayVariants(product));
    return Array.from(new Set([...selectedImages, ...allImages]));
  }, [product, selectedVariant]);

  useEffect(() => {
    setMainImage(0);
    setQty(1);
    setIsAddedToCart(false);
  }, [selectedVariant?.id]);

  const selectOption = (typeName: string, optionId: number) => {
    setSelectedOptions(previous => {
      const next = { ...previous };
      product?.variantTypes.find(type => type.name === typeName)?.options.forEach(option => {
        delete next[option.id];
      });
      next[optionId] = optionId;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (!product || !storeProduct || !selectedVariant) return;
    // Mapper already populates variantId / sku / stock from the selected variant.
    const cartProduct = mapProductDetailToStorefrontProduct(product, selectedVariant);
    void addItem(cartProduct, qty);
    setIsAddedToCart(true);
    toast.success(t('productPage.success.addedToCart', { name: product.name }));
    const ga4Item: GA4Item = {
      item_id: String(storeProduct.id),
      item_name: storeProduct.name,
      item_category: storeProduct.category,
      price: storeProduct.salePrice ?? storeProduct.price,
      quantity: qty,
    }
    trackAddToCart(ga4Item, ga4Item.price * qty)
  };

  if (loading) {
    return (
      <StorefrontLayout>
        <div className="container py-20 text-center text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{t('products.loadingDetail', { defaultValue: 'Loading product detail...' })}</div>
      </StorefrontLayout>
    );
  }

  if (!product || !storeProduct || !product.isActive) {
    return (
      <StorefrontLayout>
        <div className="container py-20 text-center">
          <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display">{t('productPage.notFound')}</h1>
          <Link to="/" className="mt-4 inline-block text-[14px] font-medium tracking-[-0.011em] text-accent">{t('productPage.goHome')}</Link>
        </div>
      </StorefrontLayout>
    );
  }

  const isOutOfStock = !selectedVariant || selectedVariant.quantity === 0 || !selectedVariant.isActive;
  const isLowStock = Boolean(selectedVariant && selectedVariant.quantity > 0 && selectedVariant.quantity < 5);
  const currentImage = images[mainImage];

  return (
    <StorefrontLayout>
      <PageMeta
        title={storeProduct ? `${storeProduct.name} — Opto Vestor` : 'Product — Opto Vestor'}
        description={storeProduct ? `Buy ${storeProduct.name} at wholesale price on Opto Vestor.` : undefined}
        canonical={storeProduct ? `/product/${slug}` : undefined}
        ogType="product"
        pageType="public"
      />
      <div className="container py-6 animate-fade-in">
        <div className="mb-6 hidden md:flex items-center gap-2 text-[13px] font-normal tracking-[-0.006em] text-muted-foreground">
          <Link to="/" className="hover:text-accent">{t('nav.home')}</Link> <span>/</span>
          <Link to={`/category/${createCategorySlug(product.categoryName)}`} className="hover:text-accent">{product.categoryName}</Link> <span>/</span>
          <span className="line-clamp-1 text-foreground font-medium">{product.name}</span>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={currentImage || placeholder}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>
            {images.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <button key={image} onClick={() => setMainImage(index)} className={`h-16 w-16 overflow-hidden rounded-md border-2 ${index === mainImage ? 'border-accent' : 'border-border'}`}>
                    <img src={image} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="mb-2 text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground lg:text-[34px] lg:tracking-[-0.024em]">{product.name}</h1>
            <p className="mb-4 text-[13px] font-medium tracking-[-0.006em] text-muted-foreground uppercase">{product.categoryName}</p>



            <div className="mb-4 flex items-baseline gap-3">
              <span className="text-[32px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground tabular-nums">{selectedVariant && selectedVariant.price > 0 ? formatPrice(selectedVariant.price) : t('products.setSkuPrice', { defaultValue: 'Set SKU price' })}</span>
            </div>

            {isOutOfStock && <span className="mb-4 inline-block rounded bg-destructive/10 px-3 py-1 text-[12px] font-semibold tracking-[-0.005em] text-destructive">{t('productPage.outOfStock')}</span>}
            {isLowStock && <span className="mb-4 inline-block rounded bg-warning/10 px-3 py-1 text-[12px] font-semibold tracking-[-0.005em] text-warning">{t('productPage.onlyLeft', { count: selectedVariant?.quantity ?? 0 })}</span>}
            {!isOutOfStock && !isLowStock && <span className="mb-4 inline-block rounded bg-success/10 px-3 py-1 text-[12px] font-semibold tracking-[-0.005em] text-success">{t('productPage.inStock')}</span>}

            <div className="mb-5 space-y-3 border-t border-border pt-4">
              {product.variantTypes.map(type => (
                <div key={type.id}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{type.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {type.options.map(option => {
                      const active = selectedOptions[option.id] === option.id;
                      const optionImage = resolveProductMediaUrl(option.imageUrl);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => selectOption(type.name, option.id)}
                          className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-[13px] font-medium tracking-[-0.006em] transition-colors ${active ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-background text-foreground hover:border-accent/50'}`}
                        >
                          {optionImage && <img src={optionImage} alt="" className="h-6 w-6 rounded object-contain" />}
                          {option.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6 flex items-center gap-3">
              {isAddedToCart ? (
                <>
                  <div className="flex items-center rounded-md border border-border shrink-0">
                    <button
                      onClick={() => {
                        const n = qty - 1;
                        if (n <= 0) { updateQty(cartProductId, 0); setIsAddedToCart(false); setQty(1); }
                        else { setQty(n); updateQty(cartProductId, n); }
                      }}
                      className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-muted"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="flex h-10 w-12 items-center justify-center border-x border-border bg-background text-[15px] font-medium tracking-[-0.011em] tabular-nums">{qty}</span>
                    <button
                      onClick={() => { const n = Math.min(selectedVariant?.quantity ?? 1, qty + 1); setQty(n); updateQty(cartProductId, n); }}
                      className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-muted"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <Link to="/cart" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-accent text-[16px] font-semibold tracking-[-0.014em] text-accent-foreground hover:bg-accent/90">
                    <ShoppingCart size={20} /> {t('productPage.goToCart', { defaultValue: 'Cartga o\'tish' })}
                  </Link>
                </>
              ) : (
                <button onClick={handleAddToCart} disabled={isOutOfStock} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-accent text-[16px] font-semibold tracking-[-0.014em] text-accent-foreground hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50">
                  <ShoppingCart size={20} /> {t('productPage.addToCart')}
                </button>
              )}
              <button onClick={() => void toggle(storeProduct.id)} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border transition-colors ${isWishlisted ? 'border-sale text-sale' : 'border-border text-muted-foreground hover:text-sale'}`}>
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 border-b border-border">
          <div className="flex gap-6">
            {(['description', 'variants'] as const).map(tabKey => (
              <button key={tabKey} onClick={() => setTab(tabKey)} className={`border-b-2 pb-3 text-[14px] font-semibold tracking-[-0.011em] transition-colors ${tab === tabKey ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {tabKey === 'description' ? t('common.description') : t('products.variants', { defaultValue: 'Variants' })}
              </button>
            ))}
          </div>
        </div>

        {tab === 'description' && (
          <div className="max-w-none whitespace-pre-line text-[15px] font-normal tracking-[-0.011em] leading-[1.5] text-foreground">
            {product.description || t('common.noData', { defaultValue: 'No data' })}
          </div>
        )}

        {tab === 'variants' && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {getDisplayVariants(product).map(variant => (
              <div key={variant.id} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-[15px] font-semibold tracking-[-0.011em] text-foreground">{variant.name ?? t('products.skuNumber', { id: variant.id, defaultValue: 'SKU #{{id}}' })}</p>
                  {variant.images[0] ? <img src={resolveProductMediaUrl(variant.images[0])} alt="" className="h-10 w-10 rounded object-contain" /> : <ImagePlus size={18} className="text-muted-foreground" />}
                </div>
                <p className="text-[13px] font-normal tracking-[-0.006em] text-muted-foreground tabular-nums">{formatPrice(variant.price)} · {variant.quantity} {t('products.stock', { defaultValue: 'stock' })}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {variant.combination.map(item => (
                    <span key={`${variant.id}-${item.optionId}`} className="rounded-md border border-border px-2 py-1 text-[11px] font-normal tracking-[-0.003em] text-muted-foreground">
                      {item.variantTypeName}: <span className="font-semibold text-foreground tracking-[-0.005em]">{item.optionName}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-[24px] font-bold tracking-[-0.018em] leading-[1.15] font-display text-foreground">{t('productPage.relatedProducts')}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}
            </div>
          </div>
        )}

        <RecentlyViewedSection excludeProductId={product.id} className="mt-12" />
      </div>
    </StorefrontLayout>
  );
};

export default ProductPage;
