// app/api/firebase-messaging-sw/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Add timestamp to ensure content changes on each request
  const timestamp = new Date().getTime();
  
  const swContent = `
// Service Worker - Generated at: ${new Date().toISOString()}
// Cache-busting timestamp: ${timestamp}

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
  authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
  projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
  storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background Message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'notification-tag',
    requireInteraction: false,
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Focus or open the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
  `;

  return new NextResponse(swContent, {
    headers: {
      'Content-Type': 'application/javascript',
      'Service-Worker-Allowed': '/',
      // Multiple cache-busting headers
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      // Add ETag based on timestamp to force revalidation
      'ETag': `"${timestamp}"`,
      // Add Vary header
      'Vary': 'Accept-Encoding',
    },
  });
}