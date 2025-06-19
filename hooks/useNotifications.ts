// hooks/useNotifications.ts
'use client';

import { useEffect, useState, useCallback } from 'react';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load notifications from localStorage on mount (only on client)
  useEffect(() => {
    if (!isClient) return;
    
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        const processedNotifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(processedNotifications);
      }
    } catch (error) {
      console.error('Error parsing stored notifications:', error);
      // Clear corrupted data
      localStorage.removeItem('notifications');
    } finally {
      setIsInitialized(true);
    }
  }, [isClient]);

  // Save notifications to localStorage whenever they change (only on client and after initialization)
  useEffect(() => {
    if (!isClient || !isInitialized) return;
    
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, [notifications, isClient, isInitialized]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      console.log('Adding notification:', newNotification);
      console.log('Updated notifications:', updated);
      return updated;
    });
  }, []);

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
    if (isClient) {
      try {
        localStorage.removeItem('notifications');
      } catch (error) {
        console.error('Error clearing notifications from storage:', error);
      }
    }
  }, [isClient]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Simulate receiving notifications for demo purposes
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
    console.log('Simulating notification:', { ...notification, type });
    addNotification({
      ...notification,
      type,
      read: false,
    });
  }, [addNotification]);

  return {
    // Notifications management
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    
    // Demo/testing
    simulateNotification,
    
    // Client state
    isClient,
    isInitialized,
  };
};

// Simplified hook for sending simulated notifications
export const useSendNotification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const sendNotification = async (data: {
    userId: string;
    title: string;
    body: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    data?: { [key: string]: string };
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Add notification locally (simulating real-time notification)
      const notificationData = {
        title: data.title,
        message: data.body,
        type: data.type || 'info',
        read: false,
        data: data.data,
      };

      console.log('Sending notification via useSendNotification:', notificationData);
      addNotification(notificationData);

      console.log('Simulated notification sent successfully:', data);
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