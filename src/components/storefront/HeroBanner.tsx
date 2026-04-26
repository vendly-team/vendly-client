import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const HeroBanner = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  const slides = [
    { bg: "from-primary to-primary/80", headline: t("hero.slide1Title"), subtitle: t("hero.slide1Desc"), cta: t("hero.slide1Btn"), link: "/category/refrigerators", image: "/hero1.png" },
    { bg: "from-accent/90 to-accent/60", headline: t("hero.slide2Title"), subtitle: t("hero.slide2Desc"), cta: t("hero.slide2Btn"), link: "/category/washing-machines", image: "/hero2.png" },
    { bg: "from-info to-info/70", headline: t("hero.slide3Title"), subtitle: t("hero.slide3Desc"), cta: t("hero.slide3Btn"), link: "/category/televisions", image: "/hero3.png" },
  ];
  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4000);
    return () => clearInterval(timer);
  }, []);
  const slide = slides[current];

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[280px] sm:h-[380px] lg:h-[480px] overflow-hidden transition-all duration-500">
        <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg} opacity-75`} />
        <div className="relative container h-full flex items-center">
          <div className="max-w-lg animate-fade-in-up" key={current}>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-display font-bold text-primary-foreground leading-tight mb-3">{slide.headline}</h1>
            <p className="text-sm sm:text-base text-primary-foreground/80 mb-6">{slide.subtitle}</p>
            <Link to={slide.link} className="inline-flex h-11 px-8 items-center rounded-lg bg-card text-foreground font-semibold text-sm hover:bg-card/90 transition-colors">
              {slide.cta}
            </Link>
          </div>
        </div>
        <button onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm text-primary-foreground flex items-center justify-center hover:bg-card/40 transition-colors" aria-label={t("hero.previous")}>
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => setCurrent((c) => (c + 1) % slides.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm text-primary-foreground flex items-center justify-center hover:bg-card/40 transition-colors" aria-label={t("hero.nextSlide")}>
          <ChevronRight size={20} />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-card w-6" : "bg-primary-foreground/40"}`} aria-label={t("hero.slideN", { n: i + 1 })} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
