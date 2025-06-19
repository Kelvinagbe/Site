// components/FirebaseProvider.tsx
'use client';

import { useEffect, ReactNode } from 'react';
import { requestNotificationPermission } from '@/lib/firebase';

interface FirebaseProviderProps {
  children: ReactNode;
}

export default function FirebaseProvider({ children }: FirebaseProviderProps) {
  useEffect(() => {
    const initializeFirebase = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // Register service worker
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Firebase Service Worker registered:', registration);
          
          // Wait a bit for service worker to be ready
          await navigator.serviceWorker.ready;
          
          // Request notification permission and get FCM token
          const token = await requestNotificationPermission();
          
          if (token) {
            // You can send this token to your backend here
            console.log('Ready to receive notifications with token:', token);
            // Example: await sendTokenToBackend(token);
          }
          
        } catch (error) {
          console.error('Firebase initialization failed:', error);
        }
      }
    };

    initializeFirebase();
  }, []);

  return <>{children}</>;
}