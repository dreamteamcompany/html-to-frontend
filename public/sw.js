const CACHE_NAME = 'km-v2';
const urlsToCache = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'Новое уведомление', body: event.data.text() };
  }

  const title = data.title || 'Новый счёт на согласование';
  const options = {
    body: data.body || 'У вас новое уведомление',
    icon: 'https://cdn.poehali.dev/projects/f80fd906-4206-41c6-bbee-1ea450433e49/files/favicon-1766477326634.svg',
    badge: 'https://cdn.poehali.dev/projects/f80fd906-4206-41c6-bbee-1ea450433e49/files/favicon-1766477326634.svg',
    data: {
      url: data.url || '/',
      payment_id: data.payment_id || null,
    },
    tag: data.tag || 'payment-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Открыть' },
      { action: 'close', title: 'Закрыть' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = '/';

  if (event.action === 'close') {
    return;
  }

  if (data.payment_id) {
    targetUrl = `/payments?payment_id=${data.payment_id}`;
  } else if (data.url) {
    targetUrl = data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NAVIGATE', url: targetUrl });
          return client.focus();
        }
      }
      return clients.openWindow(self.location.origin + targetUrl);
    })
  );
});
