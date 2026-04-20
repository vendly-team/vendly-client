import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import ProductCard from '@/components/storefront/ProductCard';
import { products } from '@/shared/data/products';
import { categories } from '@/shared/data/categories';
import { reviews as allReviews } from '@/shared/data/reviews';
import { useCartStore } from '@/shared/store/cartStore';
import { useWishlistStore } from '@/shared/store/wishlistStore';
import { useAuthStore } from '@/shared/store/authStore';
import { formatPrice, getDiscountPercent } from '@/shared/utils';
import { Heart, ShoppingCart, Star, Lock, Info, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

const ProductPage = () => {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => product ? s.productIds.includes(product.id) : false);
  const { isAuthenticated, user } = useAuthStore();
  const [mainImage, setMainImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewPage, setReviewPage] = useState(1);

  if (!product) return <StorefrontLayout><div className="container py-20 text-center"><h1 className="text-2xl font-bold">Product not found</h1><Link to="/" className="text-accent mt-4 inline-block">Go Home</Link></div></StorefrontLayout>;

  const category = categories.find((c) => c.id === product.categoryId);
  const discount = product.salePrice ? getDiscountPercent(product.price, product.salePrice) : 0;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;
  const productReviews = allReviews.filter((r) => r.productId === product.id && r.status === 'approved');
  const relatedProducts = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);
  const reviewsPerPage = 5;
  const pagedReviews = productReviews.slice((reviewPage - 1) * reviewsPerPage, reviewPage * reviewsPerPage);
  const totalReviewPages = Math.ceil(productReviews.length / reviewsPerPage);

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`${product.name} added to cart`);
  };

  const handleSubmitReview = () => {
    if (reviewRating === 0 || !reviewText.trim()) { toast.error('Please add a rating and review text'); return; }
    toast.success('Your review has been submitted and is awaiting moderation.');
    setReviewRating(0);
    setReviewText('');
  };

  return (
    <StorefrontLayout>
      <div className="container py-6 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-accent">Home</Link> <span>/</span>
          {category && <><Link to={`/category/${category.slug}`} className="hover:text-accent">{category.name}</Link> <span>/</span></>}
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
              <img src={product.images[mainImage] || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setMainImage(i)} className={`w-16 h-16 rounded-md overflow-hidden border-2 ${i === mainImage ? 'border-accent' : 'border-border'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.floor(product.rating) ? "fill-warning text-warning" : "text-border"} />)}</div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">SKU: {product.sku}</p>

            {product.syncSource === 'external' && (
              <div className="flex items-center gap-2 bg-warning/10 border border-warning/30 rounded-md px-3 py-2 mb-4 text-sm text-warning">
                <Info size={16} /> Synced from external source
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-4">
              {product.salePrice ? (
                <>
                  <span className="text-3xl font-bold text-sale">{formatPrice(product.salePrice)}</span>
                  <span className="text-xl text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  <span className="bg-sale text-white text-sm font-bold px-2 py-0.5 rounded">−{discount}%</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</span>
              )}
            </div>

            {isOutOfStock && <span className="inline-block bg-destructive/10 text-destructive text-sm font-medium px-3 py-1 rounded mb-4">Out of Stock</span>}
            {isLowStock && <span className="inline-block bg-warning/10 text-warning text-sm font-medium px-3 py-1 rounded mb-4">Only {product.stock} left!</span>}
            {!isOutOfStock && !isLowStock && <span className="inline-block bg-success/10 text-success text-sm font-medium px-3 py-1 rounded mb-4">In Stock</span>}

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-border rounded-md">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted"><Minus size={16} /></button>
                <input type="number" value={qty} onChange={(e) => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))} className="w-14 h-10 text-center border-x border-border bg-background text-sm" />
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted"><Plus size={16} /></button>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <button onClick={handleAddToCart} disabled={isOutOfStock} className="flex-1 h-12 bg-accent text-accent-foreground rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed">
                <ShoppingCart size={20} /> Add to Cart
              </button>
              <button onClick={() => toggle(product.id)} className={`h-12 w-12 border rounded-lg flex items-center justify-center transition-colors ${isWishlisted ? 'border-sale text-sale' : 'border-border text-muted-foreground hover:text-sale'}`}>
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-6">
            {(['description', 'specs', 'reviews'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {t === 'description' ? 'Description' : t === 'specs' ? 'Specifications' : `Reviews (${productReviews.length})`}
              </button>
            ))}
          </div>
        </div>

        {tab === 'description' && <div className="prose max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: product.description }} />}

        {tab === 'specs' && (
          <table className="w-full text-sm">
            <tbody>
              {product.specifications.map((s, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-muted/50' : ''}>
                  <td className="px-4 py-3 font-medium text-foreground w-1/3">{s.key}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'reviews' && (
          <div>
            {pagedReviews.map((r) => (
              <div key={r.id} className="border-b border-border py-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-foreground">{r.userName}</span>
                  <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < r.rating ? "fill-warning text-warning" : "text-border"} />)}</div>
                  <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">{r.text}</p>
              </div>
            ))}
            {totalReviewPages > 1 && (
              <div className="flex gap-2 mt-4">
                {Array.from({ length: totalReviewPages }, (_, i) => (
                  <button key={i} onClick={() => setReviewPage(i + 1)} className={`h-8 w-8 rounded text-sm ${reviewPage === i + 1 ? 'bg-accent text-accent-foreground' : 'border border-border'}`}>{i + 1}</button>
                ))}
              </div>
            )}
            {isAuthenticated && (
              <div className="mt-6 bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Write a Review</h4>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} onClick={() => setReviewRating(s)}><Star size={24} className={s <= reviewRating ? "fill-warning text-warning" : "text-border"} /></button>
                  ))}
                </div>
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your experience..." className="w-full h-24 p-3 glass-input rounded-md text-sm resize-none mb-3" />
                <button onClick={handleSubmitReview} className="bg-accent text-accent-foreground px-6 py-2 rounded-md text-sm font-medium hover:bg-accent/90">Submit Review</button>
              </div>
            )}
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-display font-bold text-foreground mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default ProductPage;
