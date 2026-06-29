import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useBanners } from "@/shared/hooks/useBanners";
import { getBannerImageUrl, type HeroBannerDto } from "@/shared/api/bannersApi";
import { useI18nLanguage } from "@/hooks/useI18nLanguage";

// Map i18n language code → MultiLanguageField key
const langKey: Record<string, "uz" | "ru" | "en" | "cyrl"> = {
  uz: "uz",
  ru: "ru",
  en: "en",
  "uz-Cyrl": "cyrl",
};

// Fallback slides — used if API returns nothing (e.g. before seeding)
const FALLBACK_SLIDES = [
  { image: "/hero1.png" },
  { image: "/hero2.png" },
  { image: "/hero3.png" },
];

const HeroBanner = () => {
  const { t } = useTranslation();
  const language = useI18nLanguage();
  const { banners, loading } = useBanners();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Build display slides from API data, with fallback
  const slides = useMemo(() => {
    if (banners.length > 0) return banners;

    // Fallback — static images with localized i18n text
    return FALLBACK_SLIDES.map((s, i) => ({
      id: `fallback-${i}`,
      imageUrl: s.image,
      title: { uz: t(`hero.slide${i + 1}Title`), ru: t(`hero.slide${i + 1}Title`), en: t(`hero.slide${i + 1}Title`), cyrl: t(`hero.slide${i + 1}Title`) },
      subtitle: { uz: t(`hero.slide${i + 1}Desc`), ru: t(`hero.slide${i + 1}Desc`), en: t(`hero.slide${i + 1}Desc`), cyrl: t(`hero.slide${i + 1}Desc`) },
      badgeText: null,
      ctaText: { uz: t(`hero.slide${i + 1}Btn`), ru: t(`hero.slide${i + 1}Btn`), en: t(`hero.slide${i + 1}Btn`), cyrl: t(`hero.slide${i + 1}Btn`) },
      ctaLink: i === 0 ? "/category/refrigerators" : i === 1 ? "/category/washing-machines" : "/category/televisions",
      sortOrder: i,
      isActive: true,
    })) as HeroBannerDto[];
  }, [banners, t]);

  const currentLangKey = langKey[language] ?? "uz";

  // Get text for current language, fallback to first available
  const getLocalizedText = (field: HeroBannerDto["title"] | null | undefined): string => {
    if (!field) return "";
    return field[currentLangKey] || field.uz || field.ru || field.en || "";
  };

  // Reset index if slides change
  useEffect(() => {
    if (current >= slides.length) setCurrent(0);
  }, [slides.length, current]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => goTo((current + 1) % slides.length), 4500);
    return () => clearInterval(timer);
  }, [current, slides.length]);

  const goTo = (index: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 500);
  };

  if (loading) {
    return (
      <section className="container py-3">
        <div className="relative rounded-2xl overflow-hidden h-[220px] sm:h-[300px] lg:h-[380px] bg-muted flex items-center justify-center">
          <Loader2 className="text-muted-foreground animate-spin" size={24} />
        </div>
      </section>
    );
  }

  if (slides.length === 0) return null;

  const slide = slides[current];
  const bgImage = slide.imageUrl ? getBannerImageUrl(slide.imageUrl) : "";
  const headline = getLocalizedText(slide.title);
  const subtitle = getLocalizedText(slide.subtitle);
  const badge = getLocalizedText(slide.badgeText);
  const cta = getLocalizedText(slide.ctaText);

  return (
    <section className="container py-3">
      <div
        className="relative rounded-2xl overflow-hidden h-[220px] sm:h-[300px] lg:h-[380px] shadow-sm"
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) {
            goTo(diff > 0
              ? (current + 1) % slides.length
              : (current - 1 + slides.length) % slides.length);
          }
          touchStartX.current = null;
        }}
      >
        {/* Background image */}
        {bgImage ? (
          <img
            src={bgImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: animating ? 0.7 : 1 }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-accent/5" />
        )}

        {/* Gradient overlay — left side only for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

        {/* Content */}
        <div className="relative h-full flex items-center px-6 sm:px-10 lg:px-14">
          {/* Left: text block */}
          <div
            key={current}
            className="flex flex-col gap-2 sm:gap-3 max-w-[55%] sm:max-w-[48%]"
            style={{ animation: "heroBannerFadeUp 0.45s ease both" }}
          >
            {headline && (
              <h1 className="text-[18px] sm:text-[28px] lg:text-[38px] font-bold leading-[1.1] tracking-tight text-white drop-shadow-sm">
                {headline}
              </h1>
            )}
            {subtitle && (
              <p className="text-[11px] sm:text-[14px] lg:text-[16px] font-normal leading-[1.4] text-white/85 line-clamp-2">
                {subtitle}
              </p>
            )}
            {badge && (
              <div className="inline-flex items-center justify-center w-fit mt-1 rounded-xl bg-[#E8401C] px-4 py-2 sm:px-5 sm:py-2.5 shadow-md">
                <span className="text-[16px] sm:text-[22px] lg:text-[28px] font-extrabold leading-none text-white tracking-tight">
                  {badge}
                </span>
              </div>
            )}
            {cta && slide.ctaLink && (
              <Link
                to={slide.ctaLink}
                className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-lg bg-white/95 hover:bg-white px-4 py-2 sm:px-5 sm:py-2.5 text-[12px] sm:text-[14px] font-semibold text-gray-900 shadow transition-colors"
              >
                {cta}
              </Link>
            )}
          </div>
        </div>

        {/* Left nav button */}
        {slides.length > 1 && (
          <button
            onClick={() => goTo((current - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/75 hover:bg-white backdrop-blur-sm text-gray-800 hidden sm:flex items-center justify-center shadow transition-colors z-10"
            aria-label={t("hero.previous")}
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Right nav button */}
        {slides.length > 1 && (
          <button
            onClick={() => goTo((current + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/75 hover:bg-white backdrop-blur-sm text-gray-800 hidden sm:flex items-center justify-center shadow transition-colors z-10"
            aria-label={t("hero.nextSlide")}
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Dot indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={t("hero.slideN", { n: i + 1 })}
                className={`h-[6px] rounded-full transition-all duration-300 ${
                  i === current ? "w-5 bg-white" : "w-[6px] bg-white/45"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes heroBannerFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default HeroBanner;
