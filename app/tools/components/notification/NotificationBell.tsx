import React, { useState } from 'react';
import { useNotifications } from '../../../../hooks/useNotifications';

// Bell Icon
const BellIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

// Back Arrow Icon
const BackIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  if (!isOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Notifications</h1>
            <p className="text-gray-600">Stay updated with your latest activities</p>
          </div>
          
          <button
            onClick={() => setIsOpen(true)}
            className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-4"
          >
            <BellIcon className="w-10 h-10 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm rounded-full h-8 w-8 flex items-center justify-center font-bold shadow-lg animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          <div className="text-sm text-gray-500">
            {unreadCount > 0 ? (
              <p className="font-medium text-blue-600">
                You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </p>
            ) : (
              <p>All caught up!</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between p-4 pt-12">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <BackIcon className="w-6 h-6" />
          </button>
          
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold">Notifications</h1>
            <p className="text-sm opacity-90">
              {notifications.length} total • {unreadCount} unread
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm px-4 py-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <BellIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications yet</h3>
            <p className="text-gray-600">When you get notifications, they&apos;ll appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 transition-all duration-200 ${
                  !notification.read 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      !notification.read ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {getTypeIcon(notification.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {notification.title}
                      </h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 text-base leading-relaxed mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formatTime(notification.timestamp)}
                      </span>
                      
                      {!notification.read && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationBell;