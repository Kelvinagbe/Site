'use client';

import { useEffect, useState } from 'react';

export default function PWAHandler() {
  const [isOnline, setIsOnline] = useState(true);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Register service worker
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js', {
            scope: '/tools',
            updateViaCache: 'none'
          });

          setRegistration(reg);
          console.log('✅ Service Worker registered');

          // Handle service worker updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New version available - will update on next visit');
                }
              });
            }
          });

          setInterval(() => reg.update(), 60000);

        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      }
    };

    // Online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for PWA events (for logging/analytics)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('💾 PWA install prompt will be shown by browser');
      // Don't prevent default - let browser handle it
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully');
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    registerSW();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 bg-amber-500 text-white px-3 py-2 rounded-lg shadow-lg z-50 text-sm">
          📡 You&apos;re offline
        </div>
      )}

      {/* Custom install prompt */}
      {showInstallPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  📱
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Install App</h3>
                  <p className="text-sm text-gray-600">Add to your home screen</p>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm mb-6">
                Install this app on your device for quick access and a better experience.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDismissInstall}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Not now
                </button>
                <button
                  onClick={handleInstallClick}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Install
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}