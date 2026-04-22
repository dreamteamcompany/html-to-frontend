import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/auth'];

type BrowserKind = 'chrome' | 'edge' | 'yandex' | 'opera' | 'firefox' | 'safari' | 'other';

const detectBrowser = (): BrowserKind => {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/YaBrowser/i.test(ua)) return 'yandex';
  if (/Edg\//i.test(ua)) return 'edge';
  if (/OPR\/|Opera/i.test(ua)) return 'opera';
  if (/Firefox\//i.test(ua)) return 'firefox';
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua) && !/OPR\//i.test(ua)) return 'chrome';
  if (/Safari\//i.test(ua) && /Version\//i.test(ua)) return 'safari';
  return 'other';
};

const BROWSER_INSTRUCTIONS: Record<BrowserKind, { title: string; steps: string[] }> = {
  chrome: {
    title: 'Google Chrome',
    steps: [
      'Нажмите на иконку замка слева от адреса сайта',
      'Найдите пункт «Уведомления» и выберите «Разрешить»',
      'Обновите страницу (F5)',
      'Нажмите «Включить уведомления» повторно',
    ],
  },
  edge: {
    title: 'Microsoft Edge',
    steps: [
      'Нажмите на иконку замка слева от адреса сайта',
      'В разделе «Разрешения» включите «Уведомления»',
      'Обновите страницу (F5)',
      'Нажмите «Включить уведомления» повторно',
    ],
  },
  yandex: {
    title: 'Яндекс.Браузер',
    steps: [
      'Нажмите на иконку замка слева от адреса сайта',
      'Выберите «Подробнее» → «Уведомления» → «Разрешить»',
      'Обновите страницу (F5)',
      'Нажмите «Включить уведомления» повторно',
    ],
  },
  opera: {
    title: 'Opera',
    steps: [
      'Нажмите на иконку замка слева от адреса сайта',
      'В разделе «Уведомления» выберите «Разрешить»',
      'Обновите страницу (F5)',
      'Нажмите «Включить уведомления» повторно',
    ],
  },
  firefox: {
    title: 'Mozilla Firefox',
    steps: [
      'Нажмите на иконку замка слева от адреса сайта',
      'Рядом с «Отправка уведомлений» нажмите крестик, чтобы снять запрет',
      'Обновите страницу (F5)',
      'Нажмите «Включить уведомления» и разрешите во всплывающем окне',
    ],
  },
  safari: {
    title: 'Safari',
    steps: [
      'Откройте меню Safari → «Настройки» → вкладка «Веб-сайты»',
      'Слева выберите «Уведомления»',
      'Для этого сайта установите значение «Разрешить»',
      'Обновите страницу (⌘R) и нажмите «Включить уведомления» повторно',
    ],
  },
  other: {
    title: 'Ваш браузер',
    steps: [
      'Откройте настройки сайта (обычно иконка замка слева от адреса)',
      'Разрешите уведомления для этого сайта',
      'Обновите страницу',
      'Нажмите «Включить уведомления» повторно',
    ],
  },
};

const PushNotificationPrompt = () => {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showBlockedHelp, setShowBlockedHelp] = useState(false);
  const [browserKind, setBrowserKind] = useState<BrowserKind>('other');

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => location.pathname === route || location.pathname.startsWith(`${route}/`)
  );
  const isAuthenticated = Boolean(user && token);

  useEffect(() => {
    if (loading || !isAuthenticated || isPublicRoute) {
      setShowPrompt(false);
      return;
    }
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        const hasAsked = localStorage.getItem('notification-asked');
        if (!hasAsked) {
          const timer = setTimeout(() => setShowPrompt(true), 3000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [loading, isAuthenticated, isPublicRoute]);

  const openBlockedHelp = () => {
    setBrowserKind(detectBrowser());
    setShowBlockedHelp(true);
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Ваш браузер не поддерживает уведомления');
      localStorage.setItem('notification-asked', 'true');
      setShowPrompt(false);
      return;
    }

    if (Notification.permission === 'denied') {
      openBlockedHelp();
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      localStorage.setItem('notification-asked', 'true');

      if (result === 'denied') {
        openBlockedHelp();
        setShowPrompt(false);
        return;
      }

      if (result !== 'granted') {
        setShowPrompt(false);
        return;
      }

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast.error('Ваш браузер не поддерживает push-уведомления');
        setShowPrompt(false);
        return;
      }

      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<ServiceWorkerRegistration>((_, reject) =>
          setTimeout(() => reject(new Error('Service Worker timeout')), 5000)
        ),
      ]);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib37gp65h_-6bQr7GKW8u24mC8j3bqTXcEHFUmfwgJjTVEg7OHhpLp3sxmk'
        ),
      });

      if (user && token) {
        try {
          await fetch('https://functions.poehali.dev/cc67e884-8946-4bcd-939d-ea3c195a6598?endpoint=subscribe-push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Auth-Token': token,
            },
            body: JSON.stringify({
              subscription: subscription.toJSON(),
              user_id: user.id,
            }),
          });
        } catch (err) {
          console.error('Failed to send push subscription to server:', err);
        }
      }

      toast.success('Уведомления успешно включены');
      setShowPrompt(false);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Не удалось включить уведомления');
      setShowPrompt(false);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('notification-asked', 'true');
  };

  const hideInlinePrompt =
    loading || !isAuthenticated || isPublicRoute || !showPrompt || permission !== 'default';

  const instructions = BROWSER_INSTRUCTIONS[browserKind];

  return (
    <>
      {!hideInlinePrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-background border-2 border-primary rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Bell" size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">Включить уведомления?</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Получайте мгновенные уведомления о новых заявках и изменениях статусов
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={requestPermission} className="flex-1">
                  <Icon name="Check" size={14} className="mr-1" />
                  Включить
                </Button>
                <Button size="sm" variant="outline" onClick={dismissPrompt}>
                  Позже
                </Button>
              </div>
            </div>
            <button
              onClick={dismissPrompt}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>
      )}

      <Dialog open={showBlockedHelp} onOpenChange={setShowBlockedHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="BellOff" size={20} className="text-destructive" />
              Уведомления заблокированы
            </DialogTitle>
            <DialogDescription>
              Чтобы включить уведомления, разрешите их в настройках браузера.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <div className="text-muted-foreground">
              Инструкция для{' '}
              <span className="font-semibold text-foreground">{instructions.title}</span>:
            </div>
            <ol className="list-decimal list-inside space-y-2 text-foreground/90">
              {instructions.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground flex gap-2">
              <Icon name="Info" size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                После изменения настроек обязательно обновите страницу, чтобы браузер применил новое
                разрешение.
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockedHelp(false)}>
              Понятно
            </Button>
            <Button onClick={() => window.location.reload()}>
              <Icon name="RotateCw" size={14} className="mr-1" />
              Обновить страницу
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PushNotificationPrompt;