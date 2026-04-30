import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, ImagePlus, Package, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { productService } from '@/features/products/services/productService';
import type { ProductAdminDetailResponse } from '@/features/products/types';
import { API_BASE_URL } from '@/shared/api/http';

const resolveMediaUrl = (url?: string | null) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const ProductDetailPage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductAdminDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const detail = await productService.getById(Number(id));
        setProduct(detail);
        const firstVariant = detail.variants[0];
        setSelectedOptions(Object.fromEntries(firstVariant?.combination.map(item => [item.optionId, item.optionId]) ?? []));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t('products.errors.loadFailed', { defaultValue: 'Failed to load product' }));
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [id, t]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.find(variant => variant.combination.every(item => selectedOptions[item.optionId] === item.optionId)) ?? product.variants[0] ?? null;
  }, [product, selectedOptions]);

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

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{t('products.loadingDetail', { defaultValue: 'Loading product detail...' })}</div>;
  }

  if (!product) {
    return <div className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{t('products.notFound', { defaultValue: 'Product not found' })}</div>;
  }

  const previewImage = resolveMediaUrl(selectedVariant?.images[0]) ?? resolveMediaUrl(product.variants.find(variant => variant.images.length > 0)?.images[0]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate('/admin/products')}>
            <ArrowLeft size={18} />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display">{t('products.detailTitle', { defaultValue: 'Product detail' })}</h1>
            <p className="truncate text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{product.name}</p>
          </div>
        </div>
        <Button asChild>
          <Link to={`/admin/products/${product.id}/edit`}>
            <Pencil size={16} className="mr-2" />
            {t('common.edit', { defaultValue: 'Edit' })}
          </Link>
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[18px] font-semibold tracking-[-0.016em] leading-[1.2]">
                <Package size={18} />
                {t('products.productInformation', { defaultValue: 'Product information' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{t('common.name', { defaultValue: 'Name' })}</p>
                <p className="mt-1 text-[15px] font-semibold tracking-[-0.011em] text-foreground">{product.name}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{t('common.category', { defaultValue: 'Category' })}</p>
                <p className="mt-1 text-[15px] font-medium tracking-[-0.011em] text-foreground">{product.categoryName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={product.isActive ? 'default' : 'secondary'}>{product.isActive ? t('common.active', { defaultValue: 'Active' }) : t('common.inactive', { defaultValue: 'Inactive' })}</Badge>
                <Badge variant="outline">{product.syncSource === 0 ? t('products.manual', { defaultValue: 'Manual' }) : t('products.external', { defaultValue: 'External' })}</Badge>
                <Badge variant="outline">{product.variants.length} {t('products.sku', { defaultValue: 'SKU' })}</Badge>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{t('products.created', { defaultValue: 'Created' })}</p>
                <p className="mt-1 text-[14px] font-normal tracking-[-0.006em] text-foreground">{new Date(product.createdAt).toLocaleString(i18n.language)}</p>
              </div>
              {product.description && (
                <div className="md:col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{t('products.description', { defaultValue: 'Description' })}</p>
                  <p className="mt-1 whitespace-pre-line text-[15px] font-normal tracking-[-0.011em] leading-[1.5] text-foreground">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2]">{t('products.variantTypesAndOptions', { defaultValue: 'Variant types and options' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.variantTypes.length === 0 && <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{t('products.noVariantTypes', { defaultValue: 'No variant types found.' })}</p>}
              {product.variantTypes.map(type => (
                <div key={type.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold tracking-[-0.011em]">{type.name}</p>
                      <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground">{t('products.displayOrder', { defaultValue: 'Display order' })} {type.displayOrder ?? '-'}</p>
                    </div>
                    <Badge variant="secondary">{type.options.length} {t('products.options', { defaultValue: 'options' })}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {type.options.map(option => {
                      const optionImage = resolveMediaUrl(option.imageUrl);
                      return (
                        <span key={option.id} className="inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-[12px] font-medium tracking-[-0.003em]">
                          {optionImage ? <img src={optionImage} alt="" className="h-5 w-5 rounded-full object-contain" /> : <span className="h-5 w-5 rounded-full bg-muted" />}
                          {option.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2]">{t('products.skuData', { defaultValue: 'SKU data' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {product.variants.length === 0 ? (
                <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">{t('products.noSkuItems', { defaultValue: 'No SKU items found.' })}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-16">{t('common.id', { defaultValue: 'ID' })}</TableHead>
                      <TableHead>{t('common.name', { defaultValue: 'Name' })}</TableHead>
                      <TableHead>{t('common.price', { defaultValue: 'Price' })}</TableHead>
                      <TableHead>{t('products.quantity', { defaultValue: 'Quantity' })}</TableHead>
                      <TableHead>{t('common.status', { defaultValue: 'Status' })}</TableHead>
                      <TableHead>{t('products.images', { defaultValue: 'Images' })}</TableHead>
                      <TableHead>{t('products.combination', { defaultValue: 'Combination' })}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.variants.map(variant => {
                      const image = resolveMediaUrl(variant.images[0]);
                      return (
                        <TableRow key={variant.id}>
                          <TableCell className="font-mono text-[12px] tracking-[-0.003em] text-muted-foreground tabular-nums">{variant.id}</TableCell>
                          <TableCell className="text-[14px] font-medium tracking-[-0.011em]">{variant.name ?? '-'}</TableCell>
                          <TableCell className="text-[14px] tracking-[-0.011em] tabular-nums">{variant.price}</TableCell>
                          <TableCell className="text-[14px] tracking-[-0.011em] tabular-nums">{variant.quantity}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={variant.isActive ? 'border-success/15 bg-success/10 text-success' : 'border-border bg-muted text-muted-foreground'}>
                              {variant.isActive ? t('common.active', { defaultValue: 'Active' }) : t('common.inactive', { defaultValue: 'Inactive' })}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex h-10 w-12 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                              {image ? <img src={image} alt="" className="h-full w-full object-contain" /> : <ImagePlus size={15} className="text-muted-foreground" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1.5">
                              {variant.combination.map(item => (
                                <span key={`${variant.id}-${item.variantTypeName}-${item.optionId}`} className="rounded-md border border-border px-2 py-1 text-[11px] font-normal tracking-[-0.003em] text-muted-foreground">
                                  {item.variantTypeName}: <span className="font-semibold tracking-[-0.005em] text-foreground">{item.optionName}</span>
                                </span>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="min-w-0">
          <div className="sticky top-20 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2]">{t('products.buyerCardPreview', { defaultValue: 'Buyer card preview' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                  {previewImage ? (
                    <img src={previewImage} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground">
                      <Package size={42} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{product.categoryName}</p>
                  <p className="mt-1 text-[20px] font-bold tracking-[-0.018em] leading-[1.15] font-display">{product.name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={product.isActive ? 'default' : 'secondary'}>{product.isActive ? t('common.active', { defaultValue: 'Active' }) : t('common.inactive', { defaultValue: 'Inactive' })}</Badge>
                  <Badge variant={selectedVariant?.isActive ? 'default' : 'secondary'}>
                    {selectedVariant?.isActive ? t('products.skuActive', { defaultValue: 'SKU active' }) : t('products.skuInactive', { defaultValue: 'SKU inactive' })}
                  </Badge>
                  <Badge variant="outline">{selectedVariant?.quantity ?? 0} {t('products.stock', { defaultValue: 'stock' })}</Badge>
                </div>
                <div className="space-y-3 border-t border-border pt-3">
                  {product.variantTypes.map(type => (
                    <div key={type.id}>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{type.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {type.options.map(option => {
                          const active = selectedOptions[option.id] === option.id;
                          const optionImage = resolveMediaUrl(option.imageUrl);
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => selectOption(type.name, option.id)}
                              className={`inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-[13px] font-medium tracking-[-0.006em] transition-colors ${active ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-background text-foreground hover:border-accent/50'}`}
                            >
                              {optionImage && <img src={optionImage} alt="" className="h-5 w-5 rounded object-contain" />}
                              {option.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-accent/10 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-accent">{selectedVariant?.name ?? t('products.selectedSku', { defaultValue: 'Selected SKU' })}</p>
                  <p className="mt-1 text-[24px] font-bold tracking-[-0.018em] leading-[1.15] font-display text-accent tabular-nums">
                    {selectedVariant && selectedVariant.price > 0 ? `${selectedVariant.price.toLocaleString(i18n.language)} ${t('products.currencySom', { defaultValue: "so'm" })}` : t('products.setSkuPrice', { defaultValue: 'Set SKU price' })}
                  </p>
                  <p className="mt-1 text-[12px] font-normal tracking-[-0.003em] text-muted-foreground">
                    {selectedVariant ? t('products.skuNumber', { id: selectedVariant.id, defaultValue: 'SKU #{{id}}' }) : t('products.selectVariantOptions', { defaultValue: 'Select variant options' })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProductDetailPage;
