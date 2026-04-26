import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ProductCard from '@/components/storefront/ProductCard';
import { useCartStore } from '@/shared/store/cartStore';
import { useWishlistStore } from '@/shared/store/wishlistStore';
import { formatPrice } from '@/shared/utils';
import { Heart, ImagePlus, Info, Minus, Package, Plus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '@/features/products/services/productService';
import type { ProductAdminDetailResponse, ProductVariantResponse } from '@/features/products/types';
import {
  getDisplayVariants,
  getProductIdFromSlug,
  getVariantImages,
  mapProductDetailToStorefrontProduct,
  resolveProductMediaUrl,
} from '@/features/products/services/storefrontProductMapper';
import { createCategorySlug } from '@/shared/api/categoriesApi';
import type { Product } from '@/shared/types';

const ProductPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const [product, setProduct] = useState<ProductAdminDetailResponse | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [mainImage, setMainImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'description' | 'variants'>('description');

  const productId = getProductIdFromSlug(slug);
  const storeProduct = product ? mapProductDetailToStorefrontProduct(product) : null;
  const isWishlisted = useWishlistStore((s) => storeProduct ? s.productIds.includes(storeProduct.id) : false);

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

        const all = await productService.getAll();
        const related = await Promise.all(
          all
            .filter(item => item.isActive && item.categoryId === detail.categoryId && item.id !== detail.id)
            .slice(0, 4)
            .map(async item => mapProductDetailToStorefrontProduct(await productService.getById(item.id))),
        );
        setRelatedProducts(related);
      } catch {
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [productId]);

  const selectedVariant = useMemo<ProductVariantResponse | null>(() => {
    if (!product) return null;
    const variants = getDisplayVariants(product);
    return variants.find(variant => variant.combination.every(item => selectedOptions[item.optionId] === item.optionId)) ?? variants[0] ?? null;
  }, [product, selectedOptions]);

  const images = useMemo(() => {
    if (!product) return [];
    const selectedImages = selectedVariant ? getVariantImages([selectedVariant]) : [];
    const allImages = getVariantImages(getDisplayVariants(product));
    return Array.from(new Set([...selectedImages, ...allImages]));
  }, [product, selectedVariant]);

  useEffect(() => {
    setMainImage(0);
    setQty(1);
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
    const cartProduct = mapProductDetailToStorefrontProduct(product, selectedVariant);
    cartProduct.id = `${product.id}:${selectedVariant.id}`;
    cartProduct.sku = `SKU-${selectedVariant.id}`;
    cartProduct.stock = selectedVariant.quantity;
    addItem(cartProduct, qty);
    toast.success(t('productPage.success.addedToCart', { name: product.name }));
  };

  if (loading) {
    return (
      <StorefrontLayout>
        <div className="container py-20 text-center text-sm text-muted-foreground">{t('products.loadingDetail', { defaultValue: 'Loading product detail...' })}</div>
      </StorefrontLayout>
    );
  }

  if (!product || !storeProduct || !product.isActive) {
    return (
      <StorefrontLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">{t('productPage.notFound')}</h1>
          <Link to="/" className="mt-4 inline-block text-accent">{t('productPage.goHome')}</Link>
        </div>
      </StorefrontLayout>
    );
  }

  const isOutOfStock = !selectedVariant || selectedVariant.quantity === 0 || !selectedVariant.isActive;
  const isLowStock = Boolean(selectedVariant && selectedVariant.quantity > 0 && selectedVariant.quantity < 5);
  const currentImage = images[mainImage];

  return (
    <StorefrontLayout>
      <div className="container py-6 animate-fade-in">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-accent">{t('nav.home')}</Link> <span>/</span>
          <Link to={`/category/${createCategorySlug(product.categoryName)}`} className="hover:text-accent">{product.categoryName}</Link> <span>/</span>
          <span className="line-clamp-1 text-foreground">{product.name}</span>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-muted">
              {currentImage ? (
                <img src={currentImage} alt={product.name} className="h-full w-full object-contain" />
              ) : (
                <div className="grid h-full place-items-center text-muted-foreground">
                  <Package size={54} />
                </div>
              )}
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
            <h1 className="mb-2 text-2xl font-display font-bold text-foreground lg:text-3xl">{product.name}</h1>
            <p className="mb-4 text-sm text-muted-foreground">{product.categoryName}</p>

            {product.syncSource === 1 && (
              <div className="mb-4 flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
                <Info size={16} /> {t('products.external', { defaultValue: 'External' })}
              </div>
            )}

            <div className="mb-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">{selectedVariant && selectedVariant.price > 0 ? formatPrice(selectedVariant.price) : t('products.setSkuPrice', { defaultValue: 'Set SKU price' })}</span>
            </div>

            {isOutOfStock && <span className="mb-4 inline-block rounded bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">{t('productPage.outOfStock')}</span>}
            {isLowStock && <span className="mb-4 inline-block rounded bg-warning/10 px-3 py-1 text-sm font-medium text-warning">{t('productPage.onlyLeft', { count: selectedVariant?.quantity ?? 0 })}</span>}
            {!isOutOfStock && !isLowStock && <span className="mb-4 inline-block rounded bg-success/10 px-3 py-1 text-sm font-medium text-success">{t('productPage.inStock')}</span>}

            <div className="mb-5 space-y-3 border-t border-border pt-4">
              {product.variantTypes.map(type => (
                <div key={type.id}>
                  <p className="mb-2 text-sm font-medium text-foreground">{type.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {type.options.map(option => {
                      const active = selectedOptions[option.id] === option.id;
                      const optionImage = resolveProductMediaUrl(option.imageUrl);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => selectOption(type.name, option.id)}
                          className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm transition-colors ${active ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-background text-foreground hover:border-accent/50'}`}
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

            <div className="mb-4 flex items-center gap-3">
              <div className="flex items-center rounded-md border border-border">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-muted"><Minus size={16} /></button>
                <input type="number" value={qty} onChange={(event) => setQty(Math.max(1, Math.min(selectedVariant?.quantity ?? 1, Number(event.target.value) || 1)))} className="h-10 w-14 border-x border-border bg-background text-center text-sm" />
                <button onClick={() => setQty(Math.min(selectedVariant?.quantity ?? 1, qty + 1))} className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-muted"><Plus size={16} /></button>
              </div>
            </div>

            <div className="mb-6 flex gap-3">
              <button onClick={handleAddToCart} disabled={isOutOfStock} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-accent font-semibold text-accent-foreground hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50">
                <ShoppingCart size={20} /> {t('productPage.addToCart')}
              </button>
              <button onClick={() => toggle(storeProduct.id)} className={`flex h-12 w-12 items-center justify-center rounded-lg border transition-colors ${isWishlisted ? 'border-sale text-sale' : 'border-border text-muted-foreground hover:text-sale'}`}>
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 border-b border-border">
          <div className="flex gap-6">
            {(['description', 'variants'] as const).map(tabKey => (
              <button key={tabKey} onClick={() => setTab(tabKey)} className={`border-b-2 pb-3 text-sm font-medium transition-colors ${tab === tabKey ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {tabKey === 'description' ? t('common.description') : t('products.variants', { defaultValue: 'Variants' })}
              </button>
            ))}
          </div>
        </div>

        {tab === 'description' && (
          <div className="max-w-none whitespace-pre-line text-sm leading-relaxed text-foreground">
            {product.description || t('common.noData', { defaultValue: 'No data' })}
          </div>
        )}

        {tab === 'variants' && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {getDisplayVariants(product).map(variant => (
              <div key={variant.id} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{variant.name ?? t('products.skuNumber', { id: variant.id, defaultValue: 'SKU #{{id}}' })}</p>
                  {variant.images[0] ? <img src={resolveProductMediaUrl(variant.images[0])} alt="" className="h-10 w-10 rounded object-contain" /> : <ImagePlus size={18} className="text-muted-foreground" />}
                </div>
                <p className="text-sm text-muted-foreground">{formatPrice(variant.price)} · {variant.quantity} {t('products.stock', { defaultValue: 'stock' })}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {variant.combination.map(item => (
                    <span key={`${variant.id}-${item.optionId}`} className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                      {item.variantTypeName}: <span className="font-medium text-foreground">{item.optionName}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-display font-bold text-foreground">{t('productPage.relatedProducts')}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}
            </div>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default ProductPage;
