import { Link } from "react-router-dom";
import { categories } from "@/shared/data/categories";
import { useTranslation } from "react-i18next";

const CategoryGrid = () => {
  const { t } = useTranslation();
  return (
    <section id="category-grid-section" className="container py-10">
      <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-6">{t("categoryGrid.title")}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((cat) => (
          <Link key={cat.id} to={`/category/${cat.slug}`} className="group flex flex-col items-center gap-2 p-5 rounded-lg bg-card border border-border hover:border-accent hover:shadow-md transition-all">
            <div className="w-16 h-16 rounded-full bg-muted overflow-hidden">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-sm font-medium text-foreground text-center">{cat.name}</span>
            <span className="text-[11px] text-muted-foreground">{t("categoryGrid.productCount", { count: cat.productCount })}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
