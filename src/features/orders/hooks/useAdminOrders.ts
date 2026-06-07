import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { orderService } from '../services/orderService';
import type { Order, OrderListItem, OrderFilter } from '../types';

/** Admin: list of all orders with filters. */
export function useAdminOrders(filter?: OrderFilter) {
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
      const data = await orderService.getAll({ status, search });
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

/** Admin: a single order with status/notes/cancel actions. */
export function useAdminOrder(id: number | undefined) {
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getById(id);
      setOrder(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('orders.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = useCallback(
    async (status: string, note?: string): Promise<boolean> => {
      if (!id) return false;
      setWorking(true);
      try {
        const updated = await orderService.updateStatus(id, status, note);
        setOrder(updated);
        toast.success(t('orders.success.statusUpdated', { status: t(`orderStatus.${status}`) }));
        return true;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('orders.error.statusFailed'));
        return false;
      } finally {
        setWorking(false);
      }
    },
    [id, t],
  );

  const addNote = useCallback(
    async (note: string): Promise<boolean> => {
      if (!id) return false;
      setWorking(true);
      try {
        const created = await orderService.addNote(id, note);
        setOrder((prev) => (prev ? { ...prev, notes: [created, ...prev.notes] } : prev));
        toast.success(t('orders.success.noteAdded'));
        return true;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('orders.error.noteFailed'));
        return false;
      } finally {
        setWorking(false);
      }
    },
    [id, t],
  );

  const cancel = useCallback(
    async (reasonCode?: string, reasonText?: string): Promise<boolean> => {
      if (!id) return false;
      setWorking(true);
      try {
        const updated = await orderService.cancel(id, reasonCode, reasonText);
        setOrder(updated);
        toast.success(t('orders.success.cancelled'));
        return true;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('orders.error.cancelFailed'));
        return false;
      } finally {
        setWorking(false);
      }
    },
    [id, t],
  );

  return { order, loading, error, working, reload: fetchOrder, updateStatus, addNote, cancel };
}
