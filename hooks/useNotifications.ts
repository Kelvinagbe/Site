// hooks/useNotifications.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMessaging, getToken, onMessage, MessagePayload, isSupported } from 'firebase/messaging';
import app from '@/lib/firebase';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: { [key: string]: string };
  source?: 'local' | 'firebase';
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  // Firebase push notification states
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isLoadingPermission, setIsLoadingPermission] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Setup Firebase notifications
  useEffect(() => {
    const setupFirebaseNotifications = async () => {
      try {
        if (typeof window === 'undefined' || !('Notification' in window)) {
          console.log('This browser does not support notifications');
          return;
        }

        // Check if messaging is supported
        const messagingSupported = await isSupported();
        if (!messagingSupported) {
          console.log('Firebase messaging is not supported');
          return;
        }

        // Set initial permission status
        setPushPermission(Notification.permission);

        // Register service worker - try both paths for compatibility
        if ('serviceWorker' in navigator) {
          try {
            // First try the API route (your current setup)
            const registration = await navigator.serviceWorker.register('/api/firebase-messaging-sw', {
              scope: '/'
            });
            console.log('Service Worker registered via API route:', registration);
          } catch (error) {
            console.log('API route registration failed, trying static file:', error);
            // Fallback to static file if API route fails
            try {
              const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/'
              });
              console.log('Service Worker registered via static file:', registration);
            } catch (staticError) {
              console.error('Both service worker registration methods failed:', staticError);
            }
          }
        }

        // Get messaging instance
        const messagingInstance = getMessaging(app);

        // Get token if permission already granted
        if (Notification.permission === 'granted') {
          const currentToken = await getToken(messagingInstance, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          
          if (currentToken) {
            setFcmToken(currentToken);
            console.log('FCM Token:', currentToken);
          }
        }

        // Listen for foreground Firebase messages
        const unsubscribe = onMessage(messagingInstance, (payload: MessagePayload) => {
          console.log('Firebase foreground message received:', payload);
          
          // Add Firebase notification to our in-app system
          if (payload.notification) {
            addNotification({
              title: payload.notification.title || 'New Message',
              message: payload.notification.body || 'You have a new notification',
              type: 'info',
              read: false,
              source: 'firebase',
              data: payload.data as { [key: string]: string },
            });
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up Firebase notifications:', error);
      }
    };

    if (isClient) {
      setupFirebaseNotifications();
    }
  }, [isClient]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      source: notification.source || 'local',
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      console.log('Adding notification:', newNotification);
      return updated;
    });
  }, []);

  const requestPushPermission = async (): Promise<boolean> => {
    try {
      setIsLoadingPermission(true);

      if (typeof window === 'undefined' || !('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
      }

      // Check if messaging is supported
      const messagingSupported = await isSupported();
      if (!messagingSupported) {
        console.log('Firebase messaging is not supported');
        return false;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === 'granted') {
        const messagingInstance = getMessaging(app);

        // Get FCM token
        const currentToken = await getToken(messagingInstance, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (currentToken) {
          setFcmToken(currentToken);
          console.log('FCM Token obtained:', currentToken);
          
          // Optional: Send token to your backend for storage
          try {
            await fetch('/api/notifications/register', {
              method: 'POST',
              body: JSON.stringify({ token: currentToken }),
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (error) {
            console.log('Token registration failed (this is optional):', error);
          }
          
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error requesting push permission:', error);
      return false;
    } finally {
      setIsLoadingPermission(false);
    }
  };

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      );
      console.log('Marking as read:', id);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, read: true }));
      console.log('Marking all as read');
      return updated;
    });
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(notification => notification.id !== id);
      console.log('Removing notification:', id);
      return updated;
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    console.log('Clearing all notifications');
    setNotifications([]);
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Simulate local notifications for demo purposes
  const simulateNotification = useCallback((type: Notification['type'] = 'info') => {
    const mockNotifications = {
      info: {
        title: 'New Message',
        message: 'You have received a new message from a colleague.',
      },
      success: {
        title: 'Task Completed',
        message: 'Your task has been successfully completed.',
      },
      warning: {
        title: 'Warning',
        message: 'Please review your recent changes.',
      },
      error: {
        title: 'Error Occurred',
        message: 'An error occurred while processing your request.',
      },
    };

    const notification = mockNotifications[type];
    console.log('Simulating local notification:', { ...notification, type });
    addNotification({
      ...notification,
      type,
      read: false,
      source: 'local',
    });
  }, [addNotification]);

  return {
    // Original in-app notifications
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    simulateNotification,
    isClient,

    // Firebase push notifications
    fcmToken,
    pushPermission,
    isLoadingPermission,
    requestPushPermission,
  };
};

// Enhanced send notification hook with Firebase support
export const useSendNotification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const sendNotification = async (data: {
    userId?: string;
    title: string;
    body: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    data?: { [key: string]: string };
    sendPush?: boolean;
    token?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Send push notification via Firebase if requested
      if (data.sendPush && data.token) {
        const response = await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: data.token,
            title: data.title,
            body: data.body,
            data: data.data,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send push notification');
        }

        console.log('Push notification sent successfully');
      }

      // Always add to local notifications for immediate UI update
      const notificationData = {
        title: data.title,
        message: data.body,
        type: data.type || 'info',
        read: false,
        data: data.data,
        source: data.sendPush ? 'firebase' : 'local',
      } as const;

      console.log('Adding notification locally:', notificationData);
      addNotification(notificationData);

      return { success: true, message: 'Notification sent successfully' };
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