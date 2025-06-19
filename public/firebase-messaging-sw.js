// public/firebase-messaging-sw.js - MINIMAL VERSION FOR TESTING
console.log('Service worker loaded');

// Temporarily disable all Firebase code to test if SW itself works
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
});

// Comment out all Firebase code temporarily
/*
let app, messaging;

fetch('/api/firebase-config')
  .then(response => response.json())
  .then(async (firebaseConfig) => {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getMessaging, onBackgroundMessage } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js');

    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);

    onBackgroundMessage(messaging, (payload) => {
      console.log('Background message received:', payload);

      const notificationTitle = payload.notification?.title || 'New Notification';
      const notificationOptions = {
        body: payload.notification?.body || 'You have a new message',
        icon: payload.notification?.image || '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'background-notification',
        requireInteraction: true,
        data: {
          ...payload.data,
          clickAction: payload.data?.clickAction || '/',
        },
        actions: [
          {
            action: 'open',
            title: 'Open App',
            icon: '/icon-192x192.png'
          },
          {
            action: 'close',
            title: 'Dismiss',
            icon: '/close-icon.png'
          }
        ]
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  })
  .catch(error => {
    console.error('Failed to initialize Firebase in service worker:', error);
  });

self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const clickAction = event.notification.data?.clickAction || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(new URL(clickAction, self.location.origin).pathname) && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});
*/