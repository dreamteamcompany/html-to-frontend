import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';

interface Notification {
  id: number;
  ticket_id: number | null;
  payment_id: number | null;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  ticket_title?: string;
}

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => void;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  refresh: () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

const POLL_INTERVAL = 15_000;

const NOTIFICATION_TITLES: Record<string, string> = {
  payment_approved: 'Платёж согласован',
  payment_rejected: 'Платёж отклонён',
  payment_pending: 'Новый платёж на согласование',
  payment_revoked: 'Платёж отозван',
  payment_created: 'Новый платёж создан',
  approval_request: 'Новый счёт на согласование',
};

function getNotificationTitle(n: Notification): string {
  if (n.type && NOTIFICATION_TITLES[n.type]) return NOTIFICATION_TITLES[n.type];
  const msg = (n.message || '').toLowerCase();
  if (msg.includes('согласован') && !msg.includes('на согласование')) return 'Платёж согласован';
  if (msg.includes('отклон')) return 'Платёж отклонён';
  if (msg.includes('отозван')) return 'Платёж отозван';
  if (msg.includes('на согласование') || msg.includes('ожидает')) return 'Новый счёт на согласование';
  return 'Уведомление';
}

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const prevUnreadRef = useRef(-1);
  const shownIdsRef = useRef<Set<number>>(new Set());

  const load = useCallback(async () => {
    if (!token || !user) return;
    try {
      const res = await fetch(API_ENDPOINTS.notificationsApi, {
        headers: { 'X-Auth-Token': token },
      });
      if (res.ok) {
        const data = await res.json();
        const newCount: number = data.unread_count || 0;
        const items: Notification[] = data.notifications || [];
        setNotifications(items);
        setUnreadCount(newCount);

        if (prevUnreadRef.current >= 0 && newCount > prevUnreadRef.current) {
          const unshown = items.filter(
            (n) => !n.is_read && !shownIdsRef.current.has(n.id)
          );
          if (
            unshown.length > 0 &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            const latest = unshown[0];
            shownIdsRef.current.add(latest.id);
            new window.Notification(getNotificationTitle(latest), {
              body: latest.message,
              icon: '/favicon.ico',
              tag: `notif-${latest.id}`,
            });
          }
        }
        prevUnreadRef.current = newCount;
      }
    } catch {
      // silent
    }
  }, [token, user]);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [load]);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  const markAsRead = useCallback(async (notificationId: number) => {
    if (!token) return;
    try {
      await fetch(API_ENDPOINTS.notificationsApi, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ notification_ids: [notificationId] }),
      });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    if (!token || unreadCount === 0) return;
    setLoading(true);
    try {
      await fetch(API_ENDPOINTS.notificationsApi, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ mark_all: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      prevUnreadRef.current = 0;
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token, unreadCount]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, loading, refresh, markAsRead, markAllAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);

export default NotificationsContext;