import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { paymentService } from '../services/paymentService';

export function usePayment() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  /**
   * Creates the order on the backend and redirects the browser to the
   * bank-hosted payment page. On failure shows a toast and resets loading.
   */
  const startCheckout = useCallback(async (addressId: number) => {
    setLoading(true);
    try {
      const res = await paymentService.checkout(addressId);
      // Leave the SPA — go to Hamkorbank's hosted payment page.
      window.location.href = res.paymentUrl;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('payment.paymentFailed'));
      setLoading(false);
    }
  }, [t]);

  return { loading, startCheckout };
}
