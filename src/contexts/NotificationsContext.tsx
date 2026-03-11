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

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const prevUnreadRef = useRef(0);

  const load = useCallback(async () => {
    if (!token || !user) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.main}?endpoint=notifications`, {
        headers: { 'X-Auth-Token': token },
      });
      if (res.ok) {
        const data = await res.json();
        const newCount: number = data.unread_count || 0;
        setNotifications(data.notifications || []);
        setUnreadCount(newCount);

        if (newCount > prevUnreadRef.current && prevUnreadRef.current >= 0) {
          const latest = (data.notifications || []).find((n: Notification) => !n.is_read);
          if (latest && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Новый счёт на согласование', {
              body: latest.message,
              icon: '/favicon.ico',
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
      await fetch(`${API_ENDPOINTS.main}?endpoint=notifications`, {
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
      await fetch(`${API_ENDPOINTS.main}?endpoint=notifications`, {
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
