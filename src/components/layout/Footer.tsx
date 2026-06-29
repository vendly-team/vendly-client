import { Link } from "react-router-dom";
import { categories } from "@/shared/data/categories";
import { useTranslation } from "react-i18next";
import { OptoLogo } from "@/components/ui/OptoLogo";
import { useCompanyInfo } from "@/shared/hooks/useCompanyInfo";
import { getFileUrl } from "@/shared/api/companyInfoApi";

const Footer = () => {
  const { t } = useTranslation();
  const { info } = useCompanyInfo();

  const phone = info?.phone || t("header.phone");
  const email = info?.email || "support@optoweek.uz";
  const address = info?.address || t("footer.address");
  const ofertaUrl = info?.ofertaUrl ? getFileUrl(info.ofertaUrl) : null;

  const socials = [
    { label: "Telegram", url: info?.telegram },
    { label: "Instagram", url: info?.instagram },
    { label: "Facebook", url: info?.facebook },
    { label: "YouTube", url: info?.youTube },
  ].filter((s): s is { label: string; url: string } => Boolean(s.url));

  return (
    <footer className="bg-zinc-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <OptoLogo />
            </div>
            <p className="text-[14px] font-normal tracking-[-0.006em] text-white/60 leading-[1.5]">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-semibold text-[11px] uppercase tracking-[0.06em] mb-4 text-white/40">
              {t("footer.categories")}
            </h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-[14px] font-normal tracking-[-0.006em] text-white/60 hover:text-accent transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display font-semibold text-[11px] uppercase tracking-[0.06em] mb-4 text-white/40">
              {t("footer.customerService")}
            </h4>
            <ul className="space-y-2 text-[14px] font-normal tracking-[-0.006em] text-white/60">
              <li><Link to="/profile/orders" className="hover:text-accent transition-colors">{t("footer.trackOrder")}</Link></li>
              <li><Link to="/cart" className="hover:text-accent transition-colors">{t("footer.shoppingCart")}</Link></li>
              <li><a href="#" className="hover:text-accent transition-colors">{t("footer.returnsExchanges")}</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">{t("footer.faq")}</a></li>
              {ofertaUrl && (
                <li>
                  <a href={ofertaUrl} target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">
                    {t("footer.oferta")}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-[11px] uppercase tracking-[0.06em] mb-4 text-white/40">
              {t("footer.contactUs")}
            </h4>
            <ul className="space-y-2 text-[14px] font-normal tracking-[-0.006em] text-white/60">
              <li><a href={`tel:${phone}`} className="hover:text-accent transition-colors">📞 {phone}</a></li>
              <li><a href={`mailto:${email}`} className="hover:text-accent transition-colors">✉️ {email}</a></li>
              <li>📍 {address}</li>
              {info?.workingHours && <li>🕘 {info.workingHours}</li>}
            </ul>
            {socials.length > 0 && (
              <div className="flex gap-3 mt-4">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    title={s.label}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[12px] font-medium tracking-[-0.005em] text-white/60 hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {s.label[0]}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-[12px] font-normal tracking-[-0.003em] text-white/40">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
