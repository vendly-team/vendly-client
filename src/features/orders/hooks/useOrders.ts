import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { orderService } from '../services/orderService';
import type { Order, OrderListItem, OrderFilter } from '../types';

/** Customer: list of my orders. */
export function useMyOrders(filter?: OrderFilter) {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const status = filter?.status;
  const search = filter?.search;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getMyOrders({ status, search });
      setOrders(data ?? []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('orders.loadFailed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [status, search, t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, reload: fetchOrders };
}

/** Customer: a single order detail. */
export function useMyOrder(id: number | undefined) {
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    orderService
      .getMyOrder(id)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : t('orders.loadFailed'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, t]);

  return { order, loading, error };
}
