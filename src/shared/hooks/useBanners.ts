import { useEffect, useState } from 'react';
import { bannersApi, type HeroBannerDto } from '@/shared/api/bannersApi';
import { useI18nLanguage } from '@/hooks/useI18nLanguage';

/**
 * Storefront hook — fetches active hero banners for the current language.
 * Falls back to an empty array on error (the component handles fallback).
 */
export const useBanners = () => {
  const [banners, setBanners] = useState<HeroBannerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const language = useI18nLanguage();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await bannersApi.getActive();
        setBanners(data);
      } catch {
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [language]);

  return { banners, loading };
};
