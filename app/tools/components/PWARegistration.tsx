'use client';

import { useEffect, useState } from 'react';

export default function PWARegistration() {
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('💾 PWA install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Handle PWA install completion
    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully');
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register service worker
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
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
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
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

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install outcome: ${outcome}`);
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Install PWA prompt */}
      {showInstallPrompt && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center mb-2">
            <span className="text-lg mr-2">📱</span>
            <p className="font-semibold">Install App</p>
          </div>
          <p className="text-sm mb-3">Add Apexion to your home screen for easier access!</p>
          <div className="flex gap-2">
            <button 
              onClick={handleInstallClick}
              className="bg-white text-green-500 px-3 py-1 rounded text-sm font-medium flex-1"
            >
              Install
            </button>
            <button 
              onClick={dismissInstallPrompt}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm flex-1"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Update notification */}
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