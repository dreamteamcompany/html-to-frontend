import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
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

const POLL_INTERVAL = 15_000;

const NotificationBell = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const prevUnreadRef = useRef(0);

  const loadNotifications = useCallback(async () => {
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
    loadNotifications();
    const interval = setInterval(loadNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleMarkAsRead = useCallback(async (notificationId: number) => {
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

  const handleMarkAllAsRead = async () => {
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
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    setOpen(false);

    if (notification.payment_id) {
      navigate(`/payments?payment_id=${notification.payment_id}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval_request':
        return { name: 'Bell', color: 'text-green-500' };
      case 'approval_rejected':
        return { name: 'XCircle', color: 'text-red-500' };
      case 'approval_approved':
        return { name: 'CheckCircle', color: 'text-blue-500' };
      case 'comment_added':
        return { name: 'MessageCircle', color: 'text-yellow-500' };
      default:
        return { name: 'Bell', color: 'text-gray-500' };
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:bg-white/10"
        >
          <Icon name="Bell" size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">
            Уведомления {unreadCount > 0 && `(${unreadCount})`}
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={loading}
              className="text-xs"
            >
              Прочитать все
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Icon name="Inbox" size={48} className="mx-auto mb-2 opacity-50" />
              <p>Нет уведомлений</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const icon = getNotificationIcon(notification.type);
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 text-left hover:bg-accent transition-colors ${
                      !notification.is_read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                    } ${notification.payment_id ? 'cursor-pointer' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 flex-shrink-0 ${icon.color}`}>
                        <Icon name={icon.name} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!notification.is_read ? 'font-semibold' : ''}`}>
                          {notification.message}
                        </p>
                        {notification.payment_id && (
                          <p className="text-xs text-primary mt-1 flex items-center gap-1">
                            <Icon name="ExternalLink" size={11} />
                            Открыть платёж
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ru,
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
