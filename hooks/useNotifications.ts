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
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      }
    } catch (error) {
      console.error('Error parsing stored notifications:', error);
      // Clear corrupted data
      localStorage.removeItem('notifications');
    }
  }, [isClient]);

  // Save notifications to localStorage whenever they change (only on client)
  useEffect(() => {
    if (!isClient || notifications.length === 0) return;
    
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, [notifications, isClient]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      addNotification({
        title: data.title,
        message: data.body,
        type: data.type || 'info',
        read: false,
        data: data.data,
      });

      console.log('Simulated notification sent:', data);
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