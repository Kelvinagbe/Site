// hooks/useNotifications.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { registerServiceWorker } from '@/lib/sw-utils';

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
    image?: string;
  };
  data?: { [key: string]: string };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: { [key: string]: string };
}

export const useNotifications = () => {
  const [user] = useAuthState(auth);
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setNotifications(parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          })));
        } catch (error) {
          console.error('Error parsing stored notifications:', error);
        }
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) return;

    const initializeNotifications = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if messaging is supported
        if (!messaging) {
          throw new Error('Firebase messaging is not supported in this browser');
        }

        // Register service worker
        const registration = await registerServiceWorker();
        if (!registration) {
          throw new Error('Failed to register service worker');
        }

        // Request notification permission
        const permission = await Notification.requestPermission();
        setPermission(permission);

        if (permission === 'granted') {
          // Get FCM token
          const fcmToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });

          if (fcmToken) {
            setToken(fcmToken);
            console.log('FCM Token obtained:', fcmToken);

            // Save token to backend
            await saveTokenToBackend(user.uid, fcmToken);

            // Listen for foreground messages
            onMessage(messaging, (payload: NotificationPayload) => {
              console.log('Foreground message received:', payload);
              handleForegroundMessage(payload);
            });
          } else {
            throw new Error('Failed to generate FCM token');
          }
        } else {
          setError('Notification permission denied');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize notifications';
        setError(errorMessage);
        console.error('Notification initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeNotifications();
  }, [user]);

  const saveTokenToBackend = async (userId: string, fcmToken: string) => {
    try {
      const response = await fetch('/api/notifications/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          token: fcmToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save FCM token to backend');
      }

      console.log('FCM token saved successfully');
    } catch (error) {
      console.error('Error saving FCM token:', error);
      throw error;
    }
  };

  const handleForegroundMessage = (payload: NotificationPayload) => {
    // Add to local notifications
    if (payload.notification) {
      addNotification({
        title: payload.notification.title || 'New Notification',
        message: payload.notification.body || 'You have a new message',
        read: false,
        type: 'info',
        data: payload.data,
      });
    }

    // Show browser notification
    if (payload.notification && Notification.permission === 'granted') {
      const notification = new Notification(
        payload.notification.title || 'New Notification',
        {
          body: payload.notification.body || 'You have a new message',
          icon: payload.notification.image || '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: 'foreground-notification',
          requireInteraction: true,
          data: payload.data,
        }
      );

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        const clickAction = payload.data?.clickAction || '/';
        window.location.href = clickAction;
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  };

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setError('Failed to request notification permission');
      return 'denied';
    }
  };

  const refreshToken = async () => {
    if (!user || !messaging) return null;

    try {
      setIsLoading(true);
      const fcmToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (fcmToken) {
        setToken(fcmToken);
        await saveTokenToBackend(user.uid, fcmToken);
        return fcmToken;
      }
    } catch (error) {
      console.error('Error refreshing FCM token:', error);
      setError('Failed to refresh FCM token');
    } finally {
      setIsLoading(false);
    }

    return null;
  };

  return {
    // FCM related
    token,
    permission,
    isLoading,
    error,
    requestPermission,
    refreshToken,
    isSupported: !!messaging,
    isGranted: permission === 'granted',
    
    // Notifications management
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  };
};

// Additional hook for sending notifications
export const useSendNotification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendNotification = async (data: {
    userId: string;
    title: string;
    body: string;
    data?: { [key: string]: string };
    clickAction?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send notification');
      }

      const result = await response.json();
      console.log('Notification sent successfully:', result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send notification';
      setError(errorMessage);
      console.error('Send notification error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendNotification,
    isLoading,
    error,
  };
};