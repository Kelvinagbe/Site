'use client';

import { useEffect, useState } from 'react';

export default function PWARegistration() {
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Register service worker
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js', {
            scope: '/tools',
            updateViaCache: 'none' // Don't cache the service worker file
          });

          setRegistration(reg);
          console.log('✅ Service Worker registered successfully');

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                  console.log('🔄 New service worker available');
                }
              });
            }
          });

          // Check for updates every 30 seconds
          setInterval(() => {
            reg.update();
          }, 30000);

        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      }
    };

    registerSW();

    // Online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateServiceWorker = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return (
    <>
      {updateAvailable && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50">
          <p className="mb-2">New version available!</p>
          <button 
            onClick={updateServiceWorker}
            className="bg-white text-blue-500 px-3 py-1 rounded text-sm mr-2"
          >
            Update
          </button>
          <button 
            onClick={() => setUpdateAvailable(false)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Later
          </button>
        </div>
      )}

      {!isOnline && (
        <div className="fixed bottom-4 left-4 bg-yellow-500 text-white p-2 rounded-lg shadow-lg z-50">
          You are offline
        </div>
      )}
    </>
  );
}