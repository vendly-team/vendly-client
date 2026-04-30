import ProductCard from "./ProductCard";
import type { Product } from "@/shared/types";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

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
        <h2 className="text-[24px] sm:text-[28px] font-display font-bold tracking-[-0.022em] leading-[1.1] text-foreground">{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-[14px] font-medium tracking-[-0.011em] text-accent hover:underline">
            {t("productSection.viewAll")}
          </Link>
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
