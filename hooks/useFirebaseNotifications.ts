// hooks/useNotifications.ts
import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import app from '@/lib/firebase'; // Updated import

export function useNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        // Check if messaging is supported (helps with SSR)
        const messagingSupported = await isSupported();
        if (!messagingSupported) {
          console.log('Firebase messaging is not supported');
          return;
        }

        // Register service worker
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/api/firebase-messaging-sw');
        }
        
        // Request permission
        const permission = await Notification.requestPermission();
        setPermission(permission);
        
        if (permission === 'granted') {
          const messaging = getMessaging(app);
          
          // Get token
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
          });
          
          if (currentToken) {
            setToken(currentToken);
            console.log('FCM Token:', currentToken);
          }

          // Handle foreground messages
          onMessage(messaging, (payload) => {
            console.log('Message received:', payload);
            
            if (Notification.permission === 'granted') {
              new Notification(payload.notification?.title || 'New Message', {
                body: payload.notification?.body,
                icon: '/icon-192x192.png'
              });
            }
          });
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeMessaging();
  }, []);

  return { token, permission };
}