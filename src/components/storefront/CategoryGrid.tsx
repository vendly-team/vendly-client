import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ImagePlus } from "lucide-react";
import { useCategories } from "@/shared/hooks/useCategories";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";

const CategoryGrid = () => {
  const { t } = useTranslation();
  const { categories, loading } = useCategories({ activeOnly: true });
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!carouselApi || loading || categories.length <= 1) return;
    const interval = window.setInterval(() => {
      if (carouselApi.canScrollNext()) carouselApi.scrollNext();
      else carouselApi.scrollTo(0);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [carouselApi, categories.length, loading]);

  return (
    <section id="category-grid-section" className="py-4 sm:py-10 sm:container">
      <h2 className="hidden sm:block text-[24px] sm:text-[28px] font-display font-bold tracking-[-0.022em] leading-[1.1] text-foreground mb-6">
        {t("categoryGrid.title")}
      </h2>

      {/* Mobile grid — 5 columns */}
      <div className="sm:hidden px-3">
        {!loading && categories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-[13px] text-muted-foreground">
            {t("categories.empty", { defaultValue: "No categories found" })}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-x-1 gap-y-3">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="h-14 w-14 animate-pulse rounded-full bg-muted" />
                    <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                  </div>
                ))
              : categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-full bg-muted border border-border">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImagePlus size={18} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <span className="line-clamp-2 text-center text-[10px] leading-[1.3] font-medium text-foreground">
                      {cat.name}
                    </span>
                    <span className="text-[9px] font-normal text-muted-foreground tabular-nums">
                      {cat.productCount}
                    </span>
                  </Link>
                ))}
          </div>
        )}
      </div>

      {/* Desktop carousel */}
      <div className="hidden sm:block">
        {!loading && categories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-[14px] font-normal tracking-[-0.006em] text-muted-foreground">
            {t("categories.empty", { defaultValue: "No categories found" })}
          </div>
        ) : (
          <Carousel
            opts={{ align: "start", dragFree: true }}
            setApi={setCarouselApi}
            className="relative"
          >
            <CarouselContent className="-ml-3">
              {loading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <CarouselItem key={index} className="basis-1/2 pl-3 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                    <div className="flex h-full min-h-36 flex-col items-center gap-2 rounded-lg border border-border bg-card p-5">
                      <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
                      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-14 animate-pulse rounded bg-muted" />
                    </div>
                  </CarouselItem>
                ))}
              {!loading &&
                categories.map((cat) => (
                  <CarouselItem key={cat.id} className="basis-1/2 pl-3 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                    <Link
                      to={`/category/${cat.slug}`}
                      className="group flex h-full min-h-36 flex-col items-center gap-2 rounded-lg border border-border bg-card p-5 transition-all hover:border-accent hover:shadow-md"
                    >
                      <div className="h-16 w-16 overflow-hidden rounded-full bg-muted">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImagePlus size={20} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="line-clamp-2 min-h-10 text-center text-[14px] font-semibold tracking-[-0.011em] text-foreground">
                        {cat.name}
                      </span>
                      <span className="text-[11px] font-normal tracking-[-0.003em] text-muted-foreground tabular-nums">
                        {t("categoryGrid.productCount", { count: cat.productCount })}
                      </span>
                    </Link>
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 z-10 border-border bg-card/95 shadow-md disabled:hidden" />
            <CarouselNext className="right-2 z-10 border-border bg-card/95 shadow-md disabled:hidden" />
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default CategoryGrid;
