import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { paymentService } from '../services/paymentService';

export function usePayment() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  /**
   * Initiates payment for a draft order and redirects the browser to the
   * bank-hosted payment page. On failure shows a toast and resets loading.
   */
  const startPayment = useCallback(async (orderId: number) => {
    setLoading(true);
    try {
      const res = await paymentService.initiatePayment(orderId);
      // Persist order number before leaving the SPA — Hamkorbank may not echo it back.
      sessionStorage.setItem('pendingOrderNumber', res.orderNumber);
      window.location.href = res.paymentUrl;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('payment.paymentFailed'));
      setLoading(false);
    }
  }, [t]);

  return { loading, startPayment };
}
