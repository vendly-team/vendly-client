import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageMeta } from '@/lib/seo'

export function ServerErrorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") ?? "/";

  const handleRetry = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <PageMeta title="Server Error — Opto Vestor" pageType="private" />
      <div className="text-center">
        <h1 className="mb-4 text-[40px] font-bold tracking-[-0.024em] leading-[1.08] font-display">
          {t("serverError.title")}
        </h1>
        <p className="mb-6 text-[20px] font-normal tracking-[-0.011em] leading-[1.4] text-muted-foreground">
          {t("serverError.message")}
        </p>
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-[15px] font-medium tracking-[-0.011em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("serverError.retry")}
          </button>
          <a
            href="/"
            className="text-[15px] font-medium tracking-[-0.011em] text-muted-foreground underline hover:text-foreground"
          >
            {t("serverError.goHome")}
          </a>
        </div>
      </div>
    </div>
  );
}
