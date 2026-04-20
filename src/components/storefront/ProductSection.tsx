import ProductCard from "./ProductCard";
import type { Product } from "@/shared/types";
import { useTranslation } from "react-i18next";

interface ProductSectionProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
}

const ProductSection = ({ title, products, viewAllLink }: ProductSectionProps) => {
  const { t } = useTranslation();
  return (
    <section className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">{title}</h2>
        {viewAllLink && (
          <a href={viewAllLink} className="text-sm font-medium text-accent hover:underline">
            {t("productSection.viewAll")}
          </a>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;
