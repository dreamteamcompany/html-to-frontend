import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import { Payment } from '@/types/payment';

/**
 * Единый глобальный стор кеша платежей.
 * Используется двумя провайдерами (AllPaymentsCacheContext и PaymentsCacheContext),
 * чтобы исключить дублирующие запросы к /paymentsApi?scope=all и рассинхрон данных.
 *
 * Поведение:
 * - TTL 30 секунд с последнего успешного fetch
 * - дедупликация одновременно летящих запросов (один общий Promise)
 * - pub/sub через список подписчиков
 */

const CACHE_TTL_MS = 30_000;

let cache: Payment[] | null = null;
let cacheTime = 0;
let fetchPromise: Promise<Payment[]> | null = null;
let currentUserId: number | null | undefined = undefined;

type Listener = () => void;
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach(l => {
    try { l(); } catch { /* no-op */ }
  });
};

export const paymentsCacheSubscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export const getPaymentsCacheSnapshot = (): Payment[] | null => cache;

export const invalidatePaymentsCacheStore = () => {
  cache = null;
  cacheTime = 0;
  fetchPromise = null;
  notify();
};

export const setPaymentsCache = (next: Payment[]) => {
  cache = next;
  cacheTime = Date.now();
  notify();
};

export const removePaymentFromCache = (id: number) => {
  if (!cache) return;
  cache = cache.filter(p => p.id !== id);
  notify();
};

/**
 * Если сменился пользователь — сбрасываем кеш, чтобы не показывать данные чужого аккаунта.
 * Возвращает true, если был сброс.
 */
export const ensureUserScope = (userId: number | null | undefined): boolean => {
  if (currentUserId === undefined) {
    currentUserId = userId;
    return false;
  }
  if (currentUserId !== userId) {
    currentUserId = userId;
    cache = null;
    cacheTime = 0;
    fetchPromise = null;
    notify();
    return true;
  }
  return false;
};

/**
 * Загрузка кеша. Возвращает Payment[] из кеша (если свежий) или из сети.
 */
export const loadPaymentsCache = async (force = false): Promise<Payment[]> => {
  const now = Date.now();
  if (!force && cache && now - cacheTime < CACHE_TTL_MS) {
    return cache;
  }

  if (!fetchPromise) {
    fetchPromise = apiFetch(`${API_ENDPOINTS.paymentsApi}?scope=all`)
      .then(r => r.json())
      .then((data): Payment[] => {
        const raw: Payment[] = Array.isArray(data) ? data : (Array.isArray(data?.payments) ? data.payments : []);
        const list = [...raw].sort(
          (a, b) => new Date(b.payment_date || 0).getTime() - new Date(a.payment_date || 0).getTime(),
        );
        cache = list;
        cacheTime = Date.now();
        notify();
        return list;
      })
      .catch(err => {
        fetchPromise = null;
        throw err;
      })
      .finally(() => {
        fetchPromise = null;
      });
  }

  return fetchPromise;
};
