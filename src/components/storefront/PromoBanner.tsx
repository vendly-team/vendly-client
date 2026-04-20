import promoBanner from "@/assets/promo-banner.jpg";
import { useTranslation } from "react-i18next";

const PromoBanner = () => {
  const { t } = useTranslation();
  return (
    <section className="container py-4">
      <div className="relative rounded-xl overflow-hidden">
        <img
          src={promoBanner}
          alt={t("promo.alt")}
          className="w-full h-[140px] sm:h-[200px] object-cover"
          loading="lazy"
          width={1920}
          height={512}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-transparent flex items-center">
          <div className="container">
            <h3 className="text-lg sm:text-2xl font-display font-bold text-primary-foreground mb-1">
              {t("promo.title")}
            </h3>
            <p className="text-xs sm:text-sm text-primary-foreground/80 mb-3">
              {t("promo.desc")}
            </p>
            <a
              href="/category/all"
              className="inline-flex h-9 px-5 items-center rounded-md bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-colors"
            >
              {t("promo.cta")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
