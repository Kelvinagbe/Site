import React, { useState } from 'react';
import { useNotifications, useSendNotification } from '@/hooks/useNotifications';
import { getServiceWorkerStatus } from '@/lib/sw-utils';
import { Bell, Send, Settings, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const NotificationTestComponent = () => {
  const {
    token,
    permission,
    isLoading,
    error,
    requestPermission,
    refreshToken,
    isSupported,
    isGranted,
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
  } = useNotifications();

  const { sendNotification, isLoading: isSending } = useSendNotification();
  
  const [swStatus, setSwStatus] = useState(null);
  const [testForm, setTestForm] = useState({
    title: 'Test Notification',
    message: 'This is a test notification message',
    clickAction: '/',
  });

  const checkServiceWorkerStatus = async () => {
    const status = await getServiceWorkerStatus();
    setSwStatus(status);
  };

  const handleTestLocalNotification = () => {
    addNotification({
      title: testForm.title,
      message: testForm.message,
      read: false,
      type: 'info',
      data: { clickAction: testForm.clickAction },
    });
  };

  const handleTestFCMNotification = async () => {
    if (!token) {
      alert('FCM token not available');
      return;
    }

    try {
      await sendNotification({
        userId: 'test-user', // Replace with actual user ID
        title: testForm.title,
        body: testForm.message,
        clickAction: testForm.clickAction,
      });
      alert('FCM notification sent successfully!');
    } catch (error) {
      console.error('Failed to send FCM notification:', error);
      alert('Failed to send FCM notification');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Notification Test Dashboard</h2>
        </div>

        {/* Status Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium mb-2">Permission Status</h3>
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(permission)}
              <span className="capitalize">{permission}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Supported: {isSupported ? '✅' : '❌'}
            </div>
            {!isGranted && (
              <button
                onClick={requestPermission}
                disabled={isLoading}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Requesting...' : 'Request Permission'}
              </button>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium mb-2">FCM Token</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {token ? '✅ Token obtained' : '❌ No token'}
            </div>
            {token && (
              <div className="text-xs bg-gray-100 dark:bg-gray-600 p-2 rounded break-all">
                {token.substring(0, 50)}...
              </div>
            )}
            <button
              onClick={refreshToken}
              disabled={isLoading}
              className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              {isLoading ? 'Refreshing...' : 'Refresh Token'}
            </button>
          </div>
        </div>

        {/* Service Worker Status */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4" />
            <h3 className="font-medium">Service Worker Status</h3>
            <button
              onClick={checkServiceWorkerStatus}
              className="ml-auto px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Check Status
            </button>
          </div>
          {swStatus && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Supported: {swStatus.isSupported ? '✅' : '❌'}</div>
              <div>Active: {swStatus.isActive ? '✅' : '❌'}</div>
              <div>Controlling: {swStatus.isControlling ? '✅' : '❌'}</div>
              <div>Registered: {swStatus.registration ? '✅' : '❌'}</div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">Error:</span>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Test Form */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3">Test Notification</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={testForm.title}
                onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                value={testForm.message}
                onChange={(e) => setTestForm({ ...testForm, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Click Action URL</label>
              <input
                type="text"
                value={testForm.clickAction}
                onChange={(e) => setTestForm({ ...testForm, clickAction: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleTestLocalNotification}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Test Local
              </button>
              <button
                onClick={handleTestFCMNotification}
                disabled={isSending || !token}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Sending...' : 'Test FCM'}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">
              Notifications ({notifications.length})
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white rounded-full text-xs">
                  {unreadCount} unread
                </span>
              )}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
              >
                Mark All Read
              </button>
              <button
                onClick={clearAllNotifications}
                disabled={notifications.length === 0}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">No notifications yet</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-md border ${
                    notification.read
                      ? 'bg-gray-100 dark:bg-gray-600 border-gray-200 dark:border-gray-500'
                      : 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {notification.timestamp.toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationTestComponent;