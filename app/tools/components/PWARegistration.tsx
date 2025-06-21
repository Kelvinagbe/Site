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
            scope: '/',
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
                  // Optionally notify user that update will happen on next visit
                }
              });
            }
          });

          // Check for updates periodically
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
      {/* Simple offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 bg-amber-500 text-white px-3 py-2 rounded-lg shadow-lg z-50 text-sm">
          📡 You're offline
        </div>
      )}
    </>
  );
}
