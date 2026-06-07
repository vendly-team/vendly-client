import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

type Slide = {
  bgImage: string;
  productImage?: string;
  badge?: string;
  headline: string;
  subtitle: string;
  cta: string;
  link: string;
};

const HeroBanner = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slides: Slide[] = [
    {
      bgImage: "/hero1.png",
      headline: t("hero.slide1Title"),
      subtitle: t("hero.slide1Desc"),
      badge: t("hero.slide1Badge", { defaultValue: "" }),
      cta: t("hero.slide1Btn"),
      link: "/category/refrigerators",
    },
    {
      bgImage: "/hero2.png",
      headline: t("hero.slide2Title"),
      subtitle: t("hero.slide2Desc"),
      badge: t("hero.slide2Badge", { defaultValue: "" }),
      cta: t("hero.slide2Btn"),
      link: "/category/washing-machines",
    },
    {
      bgImage: "/hero3.png",
      headline: t("hero.slide3Title"),
      subtitle: t("hero.slide3Desc"),
      badge: t("hero.slide3Badge", { defaultValue: "" }),
      cta: t("hero.slide3Btn"),
      link: "/category/televisions",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => goTo((current + 1) % slides.length), 4500);
    return () => clearInterval(timer);
  }, [current]);

  const goTo = (index: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 500);
  };

  const slide = slides[current];

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
        <img
          src={slide.bgImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: animating ? 0.7 : 1 }}
        />

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
            <h1 className="text-[18px] sm:text-[28px] lg:text-[38px] font-bold leading-[1.1] tracking-tight text-white drop-shadow-sm">
              {slide.headline}
            </h1>
            <p className="text-[11px] sm:text-[14px] lg:text-[16px] font-normal leading-[1.4] text-white/85 line-clamp-2">
              {slide.subtitle}
            </p>
            {slide.badge && (
              <div className="inline-flex items-center justify-center w-fit mt-1 rounded-xl bg-[#E8401C] px-4 py-2 sm:px-5 sm:py-2.5 shadow-md">
                <span className="text-[16px] sm:text-[22px] lg:text-[28px] font-extrabold leading-none text-white tracking-tight">
                  {slide.badge}
                </span>
              </div>
            )}
            <Link
              to={slide.link}
              className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-lg bg-white/95 hover:bg-white px-4 py-2 sm:px-5 sm:py-2.5 text-[12px] sm:text-[14px] font-semibold text-gray-900 shadow transition-colors"
            >
              {slide.cta}
            </Link>
          </div>
        </div>

        {/* Left nav button */}
        <button
          onClick={() => goTo((current - 1 + slides.length) % slides.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/75 hover:bg-white backdrop-blur-sm text-gray-800 hidden sm:flex items-center justify-center shadow transition-colors z-10"
          aria-label={t("hero.previous")}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Right nav button */}
        <button
          onClick={() => goTo((current + 1) % slides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/75 hover:bg-white backdrop-blur-sm text-gray-800 hidden sm:flex items-center justify-center shadow transition-colors z-10"
          aria-label={t("hero.nextSlide")}
        >
          <ChevronRight size={18} />
        </button>

        {/* Dot indicators */}
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
