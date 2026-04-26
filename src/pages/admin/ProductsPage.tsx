import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ImagePlus, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { productService } from '@/features/products/services/productService';
import { useProducts } from '@/features/products/hooks/useProducts';
import { API_BASE_URL } from '@/shared/api/http';

const resolveMediaUrl = (url?: string | null) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const AdminProductsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts } = useProducts();
  const [productImages, setProductImages] = useState<Record<number, string[]>>({});
  const [imageTick, setImageTick] = useState(0);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    void fetchProducts();
  }, []);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    const interval = window.setInterval(() => setImageTick(tick => tick + 1), 2600);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const missingImageIds = products.map(product => product.id).filter(id => !(id in productImages));
    if (missingImageIds.length === 0) return;

    let cancelled = false;

    const loadImages = async () => {
      const entries = await Promise.all(
        missingImageIds.map(async id => {
          try {
            const detail = await productService.getById(id);
            const images = detail.variants
              .flatMap(variant => variant.images)
              .map(resolveMediaUrl)
              .filter((image): image is string => Boolean(image));
            return [id, images] as const;
          } catch {
            return [id, []] as const;
          }
        }),
      );

      if (!cancelled) setProductImages(previous => ({ ...previous, ...Object.fromEntries(entries) }));
    };

    void loadImages();
    return () => { cancelled = true; };
  }, [productImages, products]);

  const categoryItems = useMemo(() => {
    const items = new Map<number, string>();
    products.forEach(product => items.set(product.categoryId, product.categoryName));
    return Array.from(items, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter(product => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.categoryName.toLowerCase().includes(normalizedSearch) ||
        String(product.id).includes(normalizedSearch);
      const matchesCategory = !catFilter || String(product.categoryId) === catFilter;
      const matchesStatus = !statusFilter || (statusFilter === 'active' ? product.isActive : !product.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [catFilter, products, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleDelete = async (id: number) => {
    if (!confirm(t('products.deleteConfirm', { defaultValue: 'Delete this product?' }))) return;

    try {
      await productService.delete(id);
      await fetchProducts();
      toast.success(t('products.success.deleted', { defaultValue: 'Product deleted' }));
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : t('products.errors.deleteFailed', { defaultValue: 'Failed to delete product' }));
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await productService.toggleActive(id);
      await fetchProducts();
      toast.success(t('products.success.statusUpdated', { defaultValue: 'Product status updated' }));
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : t('products.errors.statusFailed', { defaultValue: 'Failed to update product status' }));
    }
  };

  const resetPage = () => setPage(1);

  const cutDescription = (description: string | null) => {
    if (!description) return null;
    return description.length > 30 ? `${description.slice(0, 30)}...` : description;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">{t('products.title', { defaultValue: 'Products' })}</h1>
        <Link to="/admin/products/new" className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground">
          <Plus size={16} />
          {t('products.addProduct', { defaultValue: 'Add Product' })}
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder={t('products.searchPlaceholder', { defaultValue: 'Search...' })}
            value={search}
            onChange={event => { setSearch(event.target.value); resetPage(); }}
            className="h-9 w-60 rounded-md glass-input pl-9 pr-3 text-sm"
          />
        </div>
        <select value={catFilter} onChange={event => { setCatFilter(event.target.value); resetPage(); }} className="h-9 rounded-md glass-input px-3 text-sm">
          <option value="">{t('products.allCategories', { defaultValue: 'All Categories' })}</option>
          {categoryItems.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); resetPage(); }} className="h-9 rounded-md glass-input px-3 text-sm">
          <option value="">{t('products.allStatus', { defaultValue: 'All Status' })}</option>
          <option value="active">{t('common.active', { defaultValue: 'Active' })}</option>
          <option value="inactive">{t('common.inactive', { defaultValue: 'Inactive' })}</option>
        </select>
        <Button type="button" variant="outline" size="sm" className="h-9" onClick={() => void fetchProducts()}>
          <RefreshCw size={14} className="mr-2" />
          {t('common.refresh', { defaultValue: 'Refresh' })}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>{t('common.product', { defaultValue: 'Product' })}</TableHead>
            <TableHead>{t('common.category', { defaultValue: 'Category' })}</TableHead>
            <TableHead>{t('products.variants', { defaultValue: 'Variants' })}</TableHead>
            <TableHead>{t('products.source', { defaultValue: 'Source' })}</TableHead>
            <TableHead>{t('common.status', { defaultValue: 'Status' })}</TableHead>
            <TableHead>{t('products.created', { defaultValue: 'Created' })}</TableHead>
            <TableHead className="w-28 text-right">{t('common.actions', { defaultValue: 'Actions' })}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                {t('products.loading', { defaultValue: 'Loading products...' })}
              </TableCell>
            </TableRow>
          )}

          {!loading && !error && paged.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                {t('products.empty', { defaultValue: 'No products found' })}
              </TableCell>
            </TableRow>
          )}

          {!loading && !error && paged.map(product => {
            const images = productImages[product.id] ?? [];
            const image = images.length > 0 ? images[imageTick % images.length] : null;

            return (
              <TableRow key={product.id} className="cursor-pointer" onClick={() => navigate(`/admin/products/${product.id}`)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                      {image ? <img src={image} className="h-full w-full object-contain" alt="" /> : <ImagePlus size={16} className="text-muted-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-foreground">{product.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{cutDescription(product.description) ?? t('products.productId', { id: product.id, defaultValue: 'Product #{{id}}' })}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{product.categoryName}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="rounded-md border-transparent bg-primary/5 text-primary hover:bg-primary/5">
                    {product.variantCount}
                  </Badge>
                </TableCell>
                <TableCell><Badge variant="outline">{product.syncSource === 0 ? t('products.manual', { defaultValue: 'Manual' }) : t('products.external', { defaultValue: 'External' })}</Badge></TableCell>
                <TableCell>
                  <button type="button" onClick={event => { event.stopPropagation(); void handleToggle(product.id); }}>
                    <Badge variant="outline" className={product.isActive ? 'border-success/15 bg-success/10 text-success hover:bg-success/10' : 'border-border bg-muted text-muted-foreground hover:bg-muted'}>
                      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${product.isActive ? 'bg-success' : 'bg-muted-foreground'}`} />
                      {product.isActive ? t('common.active', { defaultValue: 'Active' }) : t('common.inactive', { defaultValue: 'Inactive' })}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(product.createdAt).toLocaleDateString(i18n.language)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-accent/10 hover:text-accent" asChild title={t('common.edit', { defaultValue: 'Edit' })} onClick={event => event.stopPropagation()}>
                      <Link to={`/admin/products/${product.id}/edit`} aria-label={t('common.edit', { defaultValue: 'Edit' })}>
                        <Pencil size={15} />
                      </Link>
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={event => { event.stopPropagation(); void handleDelete(product.id); }} aria-label={t('common.delete', { defaultValue: 'Delete' })} title={t('common.delete', { defaultValue: 'Delete' })}>
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            return (
              <button key={pageNumber} type="button" onClick={() => setPage(pageNumber)} className={`h-8 w-8 rounded text-sm ${currentPage === pageNumber ? 'bg-accent text-accent-foreground' : 'border border-border'}`}>
                {pageNumber}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
