import { useTranslation } from 'react-i18next';
import { getProductPlaceholder } from '@/shared/utils';

export function useProductPlaceholder(): string {
  const { i18n } = useTranslation();
  return getProductPlaceholder(i18n.language);
}
