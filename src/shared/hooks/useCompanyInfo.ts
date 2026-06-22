import { useEffect, useState } from "react";
import { companyInfoApi, type CompanyInfoPublicDto } from "@/shared/api/companyInfoApi";
import { useI18nLanguage } from "@/hooks/useI18nLanguage";

export const useCompanyInfo = () => {
  const [info, setInfo] = useState<CompanyInfoPublicDto | null>(null);
  const [loading, setLoading] = useState(true);
  const language = useI18nLanguage();

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await companyInfoApi.getPublic();
        if (active) setInfo(data);
      } catch {
        if (active) setInfo(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, [language]);

  return { info, loading };
};
