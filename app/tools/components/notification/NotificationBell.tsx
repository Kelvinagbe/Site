// components/NotificationBell.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../../../../hooks/useNotifications';

// Add CSS for animations
const styles = `
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Ensure mobile overlay is above everything */
  .mobile-notification-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 999999 !important;
    background-color: white;
  }
  
  .dark .mobile-notification-overlay {
    background-color: rgb(17, 24, 39);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

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

// Notification Dot Icon for unread indicator
const NotificationDot = ({ className = "" }: { className?: string }) => (
  <div className={`rounded-full ${className}`} />
);

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close panel when clicking outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only handle click outside for desktop
      if (window.innerWidth >= 640) {
        if (panelRef.current && !panelRef.current.contains(event.target as Node) &&
            buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
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

  // Enhanced type color system with better contrast
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': 
        return 'text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/50 border-green-200 dark:border-green-800';
      case 'warning': 
        return 'text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800';
      case 'error': 
        return 'text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/50 border-red-200 dark:border-red-800';
      case 'info':
      default: 
        return 'text-blue-800 bg-blue-100 dark:text-blue-200 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800';
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

  // Enhanced bell button with better unread indication
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <BellIcon className="w-6 h-6" />

        {/* Enhanced unread indicator */}
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-gray-900 animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full opacity-75 animate-ping"></span>
          </>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Mobile Full Screen Overlay - Fixed positioning and z-index */}
          <div className="fixed inset-0 mobile-notification-overlay sm:hidden animate-slide-down">
            <div 
              ref={panelRef}
              className="h-full w-full flex flex-col bg-white dark:bg-gray-900"
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
              className="absolute right-0 top-full mt-2 w-96 max-h-[80vh] bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex flex-col z-[10000] animate-slide-down"
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
    </div>
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
}> = ({ notifications, unreadCount, markAsRead, markAllAsRead, getTypeColor, formatTime, onClose }) => {
  return (
    <>
      {/* Mobile Header with enhanced visibility */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0 min-h-[64px] shadow-sm">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex-shrink-0">
            <BellIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {unreadCount} unread
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          aria-label="Close notifications"
        >
          <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Mobile Actions Bar */}
      {unreadCount > 0 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={markAllAsRead}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50"
          >
            Mark all {unreadCount} as read
          </button>
        </div>
      )}

      {/* Mobile Notifications List - Enhanced scrolling */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-gray-900" style={{ WebkitOverflowScrolling: 'touch' }}>
        <NotificationsList 
          notifications={notifications}
          markAsRead={markAsRead}
          getTypeColor={getTypeColor}
          formatTime={formatTime}
          isMobile={true}
        />
      </div>

      {/* Mobile Footer - Always visible */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-lg">
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium text-white shadow-sm"
        >
          Close
        </button>
      </div>
    </>
  );
};

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
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
          <BellIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {unreadCount} unread
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Close notifications"
      >
        <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </button>
    </div>

    {/* Desktop Actions Bar */}
    {unreadCount > 0 && (
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={markAllAsRead}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50"
        >
          Mark all as read
        </button>
      </div>
    )}

    {/* Desktop Notifications List */}
    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
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
      <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Close
        </button>
      </div>
    )}
  </>
);

// Enhanced Notifications List Component
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
      <div className={`${padding} py-12 text-center bg-white dark:bg-gray-900`}>
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
    <div className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`${padding} hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 border-l-4 ${
            !notification.read 
              ? 'bg-blue-50 dark:bg-blue-950/50 border-l-blue-500 shadow-sm' 
              : 'bg-white dark:bg-gray-900 border-l-transparent hover:border-l-gray-200 dark:hover:border-l-gray-700'
          } ${isMobile ? 'active:bg-gray-100 dark:active:bg-gray-700' : ''}`}
          onClick={() => {
            if (!notification.read) {
              markAsRead(notification.id);
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !notification.read) {
              e.preventDefault();
              markAsRead(notification.id);
            }
          }}
        >
          <div className="flex items-start space-x-3">
            {/* Enhanced Read Status Indicator */}
            <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 transition-all duration-200 ${
              notification.read 
                ? 'bg-gray-300 dark:bg-gray-600' 
                : 'bg-blue-500 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800'
            }`} />

            <div className="flex-1 min-w-0">
              {/* Header with Title and Type Badge */}
              <div className="flex items-start justify-between mb-2">
                <h5 className={`text-sm font-semibold ${
                  !notification.read 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {notification.title}
                  {!notification.read && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400 text-xs font-normal">
                      • New
                    </span>
                  )}
                </h5>
                <span className={`ml-2 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 border ${getTypeColor(notification.type)}`}>
                  {notification.type}
                </span>
              </div>

              {/* Message with enhanced styling */}
              <p className={`text-sm mb-2 leading-relaxed ${
                !notification.read 
                  ? 'text-gray-700 dark:text-gray-200' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {notification.message}
              </p>

              {/* Timestamp with enhanced styling */}
              <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
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