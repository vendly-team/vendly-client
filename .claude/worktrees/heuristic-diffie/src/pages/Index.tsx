import StorefrontLayout from "@/components/layout/StorefrontLayout";
import HeroBanner from "@/components/storefront/HeroBanner";
import CategoryGrid from "@/components/storefront/CategoryGrid";
import ProductSection from "@/components/storefront/ProductSection";
import PromoBanner from "@/components/storefront/PromoBanner";
import { products } from "@/shared/data/products";

const featuredProducts = products.filter(p => ['1','7','12','14','8','5'].includes(p.id));
const saleProducts = products.filter(p => p.salePrice !== undefined);
const newArrivals = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

const Index = () => {
  return (
    <StorefrontLayout>
      <HeroBanner />
      <CategoryGrid />
      <ProductSection title="Recommended for You" products={featuredProducts.slice(0, 6)} />
      <PromoBanner />
      <ProductSection title="On Sale" products={saleProducts.slice(0, 4)} viewAllLink="/category/refrigerators" />
      <ProductSection title="New Arrivals" products={newArrivals.slice(0, 4)} viewAllLink="/category/refrigerators" />
    </StorefrontLayout>
  );
};

export default Index;
