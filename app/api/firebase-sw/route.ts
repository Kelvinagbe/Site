// app/api/firebase-sw/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const swContent = `
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
  authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
  projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
  storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}",
  databaseURL: "${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/icon-192x192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
`;

  return new NextResponse(swContent, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
}