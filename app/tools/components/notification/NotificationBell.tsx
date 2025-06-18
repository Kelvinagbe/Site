// components/NotificationBell.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../../../../hooks/useNotifications';

// Bell Icon
const BellIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

// Close Icon
const CloseIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Debug logging
  console.log('NotificationBell Debug:', {
    totalNotifications: notifications.length,
    unreadCount,
    notifications: notifications.map(n => ({
      id: n.id,
      title: n.title,
      read: n.read,
      type: n.type
    }))
  });

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when panel is open on mobile
      if (window.innerWidth < 640) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-700 bg-green-200 dark:text-green-300 dark:bg-green-800';
      case 'warning': return 'text-orange-700 bg-orange-200 dark:text-orange-300 dark:bg-orange-800';
      case 'error': return 'text-red-700 bg-red-200 dark:text-red-300 dark:bg-red-800';
      default: return 'text-blue-700 bg-blue-200 dark:text-blue-300 dark:bg-blue-800';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel - Using Portal Pattern */}
      {isOpen && (
        <>
          {/* Mobile Full Screen Overlay */}
          <div className="fixed inset-0 z-[9999] sm:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Mobile Panel - Full screen below header */}
            <div 
              ref={panelRef}
              className="absolute top-0 left-0 right-0 bottom-0 bg-white dark:bg-gray-800 flex flex-col"
              style={{ 
                top: 'var(--header-height, 64px)', // Adjust this to match your header height
                zIndex: 10000 
              }}
            >
              <MobilePanelContent 
                notifications={notifications}
                unreadCount={unreadCount}
                markAsRead={markAsRead}
                markAllAsRead={markAllAsRead}
                getTypeColor={getTypeColor}
                formatTime={formatTime}
                onClose={() => setIsOpen(false)}
              />
            </div>
          </div>

          {/* Desktop Dropdown */}
          <div className="hidden sm:block">
            <div className="fixed inset-0 z-[9999]" onClick={() => setIsOpen(false)} />
            <div 
              ref={panelRef}
              className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex flex-col z-[10000]"
            >
              <DesktopPanelContent 
                notifications={notifications}
                unreadCount={unreadCount}
                markAsRead={markAsRead}
                markAllAsRead={markAllAsRead}
                getTypeColor={getTypeColor}
                formatTime={formatTime}
                onClose={() => setIsOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

// Mobile Panel Content Component
const MobilePanelContent: React.FC<{
  notifications: any[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getTypeColor: (type: string) => string;
  formatTime: (date: Date) => string;
  onClose: () => void;
}> = ({ notifications, unreadCount, markAsRead, markAllAsRead, getTypeColor, formatTime, onClose }) => (
  <>
    {/* Mobile Header */}
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <BellIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {unreadCount} unread
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </button>
    </div>

    {/* Mobile Actions Bar */}
    {unreadCount > 0 && (
      <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={markAllAsRead}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          Mark all as read
        </button>
      </div>
    )}

    {/* Mobile Notifications List */}
    <div className="flex-1 overflow-y-auto">
      <NotificationsList 
        notifications={notifications}
        markAsRead={markAsRead}
        getTypeColor={getTypeColor}
        formatTime={formatTime}
        isMobile={true}
      />
    </div>

    {/* Mobile Footer */}
    {notifications.length > 0 && (
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium text-white"
        >
          Close
        </button>
      </div>
    )}
  </>
);

// Desktop Panel Content Component
const DesktopPanelContent: React.FC<{
  notifications: any[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getTypeColor: (type: string) => string;
  formatTime: (date: Date) => string;
  onClose: () => void;
}> = ({ notifications, unreadCount, markAsRead, markAllAsRead, getTypeColor, formatTime, onClose }) => (
  <>
    {/* Desktop Header */}
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <BellIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {unreadCount} unread
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </button>
    </div>

    {/* Desktop Actions Bar */}
    {unreadCount > 0 && (
      <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={markAllAsRead}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          Mark all as read
        </button>
      </div>
    )}

    {/* Desktop Notifications List */}
    <div className="flex-1 overflow-y-auto">
      <NotificationsList 
        notifications={notifications}
        markAsRead={markAsRead}
        getTypeColor={getTypeColor}
        formatTime={formatTime}
        isMobile={false}
      />
    </div>

    {/* Desktop Footer */}
    {notifications.length > 0 && (
      <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Close
        </button>
      </div>
    )}
  </>
);

// Shared Notifications List Component
const NotificationsList: React.FC<{
  notifications: any[];
  markAsRead: (id: string) => void;
  getTypeColor: (type: string) => string;
  formatTime: (date: Date) => string;
  isMobile: boolean;
}> = ({ notifications, markAsRead, getTypeColor, formatTime, isMobile }) => {
  const padding = isMobile ? 'p-4' : 'p-6';

  if (notifications.length === 0) {
    return (
      <div className={`${padding} py-12 text-center`}>
        <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <BellIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No notifications
        </h4>
        <p className="text-gray-500 dark:text-gray-400">
          You&apos;re all caught up! Check back later for updates.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${padding} hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors border-l-4 ${
            !notification.read 
              ? 'bg-blue-50 dark:bg-blue-900/30 border-l-blue-500' 
              : 'bg-white dark:bg-gray-800 border-l-gray-200 dark:border-l-gray-700'
          }`}
          onClick={() => {
            if (!notification.read) {
              markAsRead(notification.id);
            }
          }}
        >
          <div className="flex items-start space-x-3">
            {/* Read Status Indicator - More visible */}
            <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 border-2 ${
              notification.read 
                ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600' 
                : 'bg-blue-500 border-blue-600 shadow-lg'
            }`} />
            
            <div className="flex-1 min-w-0">
              {/* Header with Title and Type Badge */}
              <div className="flex items-start justify-between mb-2">
                <h5 className={`text-sm font-semibold ${
                  notification.read 
                    ? 'text-gray-700 dark:text-gray-300' 
                    : 'text-gray-900 dark:text-white font-bold'
                }`}>
                  {notification.title}
                </h5>
                <span className={`ml-2 text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0 shadow-sm ${getTypeColor(notification.type)}`}>
                  {notification.type}
                </span>
              </div>
              
              {/* Message */}
              <p className={`text-sm mb-2 ${
                notification.read 
                  ? 'text-gray-600 dark:text-gray-400' 
                  : 'text-gray-700 dark:text-gray-200 font-medium'
              }`}>
                {notification.message}
              </p>
              
              {/* Timestamp */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(notification.timestamp)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationBell;