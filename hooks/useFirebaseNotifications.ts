// hooks/useFirebaseNotifications.ts
import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../lib/firebase'; // Your firebase config

export function useFirebaseNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Register service worker
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/api/firebase-messaging-sw');
          console.log('Service Worker registered:', registration);
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    registerSW();
    
    // Request notification permission
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        setPermission(permission);
        
        if (permission === 'granted') {
          const messaging = getMessaging(app);
          
          // Get FCM token
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
          });
          
          if (currentToken) {
            setToken(currentToken);
            console.log('FCM Token:', currentToken);
            // Send token to your server here
          }
        }
      } catch (error) {
        console.error('Error getting permission or token:', error);
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    if (permission === 'granted') {
      const messaging = getMessaging(app);
      
      // Handle foreground messages
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        
        // Show notification when app is in foreground
        if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title || 'New Message', {
            body: payload.notification?.body,
            icon: '/icon-192x192.png',
            data: payload.data
          });
        }
      });

      return () => unsubscribe();
    }
  }, [permission]);

  return { token, permission };
}