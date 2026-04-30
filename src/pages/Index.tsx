import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import StorefrontLayout from "@/components/layout/StorefrontLayout";
import HeroBanner from "@/components/storefront/HeroBanner";
import CategoryGrid from "@/components/storefront/CategoryGrid";
import ProductSection from "@/components/storefront/ProductSection";
import PromoBanner from "@/components/storefront/PromoBanner";
import { categoriesApi, mapCategoryDto } from "@/shared/api/categoriesApi";
import type { Category, Product } from "@/shared/types";
import { productService } from "@/features/products/services/productService";
import { mapProductDetailToStorefrontProduct, mapProductListFallback } from "@/features/products/services/storefrontProductMapper";

const Index = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeProducts = async () => {
      setLoading(true);
      try {
        const [categoryDtos, productList] = await Promise.all([
          categoriesApi.getAll(),
          productService.getAll(),
        ]);

        const activeProducts = productList.filter(product => product.isActive);
        const details = await Promise.all(
          activeProducts.map(async product => {
            try {
              return mapProductDetailToStorefrontProduct(await productService.getById(product.id));
            } catch {
              return mapProductListFallback(product);
            }
          }),
        );

        setProducts(details.filter(product => product.isActive));
        setCategories(categoryDtos.map(mapCategoryDto).filter(category => category.isActive));
      } catch {
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    void loadHomeProducts();
  }, []);

  const newestProducts = useMemo(
    () => [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [products],
  );

  const categorySections = useMemo(() => {
    return categories
      .map(category => ({
        category,
        products: products
          .filter(product => product.categoryId === category.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4),
      }))
      .filter(section => section.products.length > 0)
      .slice(0, 6);
  }, [categories, products]);

  return (
    <StorefrontLayout>
      <HeroBanner />
      <CategoryGrid />
      {loading && (
        <section className="container py-8 text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
          {t("products.loading", { defaultValue: "Loading products..." })}
        </section>
      )}
      {!loading && newestProducts.length > 0 && (
        <ProductSection title={t("home.newArrivals", { defaultValue: "New arrivals" })} products={newestProducts.slice(0, 4)} />
      )}
      <PromoBanner />
      {!loading && categorySections.map(section => (
        <ProductSection
          key={section.category.id}
          title={section.category.name}
          products={section.products}
          viewAllLink={`/category/${section.category.slug}`}
        />
      ))}
      {!loading && products.length === 0 && (
        <section className="container py-8">
          <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
            {t("products.empty", { defaultValue: "No products found" })}
          </div>
        </section>
      )}
    </StorefrontLayout>
  );
};

export default Index;
