// lib/sw-utils.ts
'use client';

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return null;
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
      updateViaCache: 'none', // Always check for updates
    });

    console.log('Service Worker registered successfully:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        console.log('New service worker found, installing...');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New service worker installed, ready to activate');

            // Optionally show a notification to the user that an update is available
            showUpdateAvailableNotification();
          }
        });
      }
    });

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('Service Worker is ready');

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (registration) {
      const result = await registration.unregister();
      console.log('Service Worker unregistered:', result);
      return result;
    }
    return false;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
};

export const updateServiceWorker = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (registration) {
      await registration.update();
      console.log('Service Worker update check completed');
    }
  } catch (error) {
    console.error('Service Worker update failed:', error);
  }
};

const showUpdateAvailableNotification = () => {
  // You can customize this notification or use a toast library
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('App Update Available', {
      body: 'A new version of the app is available. Refresh to update.',
      icon: '/icon-192x192.png',
      tag: 'app-update',
      requireInteraction: true,
    });
  }
};

export const getServiceWorkerStatus = async (): Promise<{
  isSupported: boolean;
  registration: ServiceWorkerRegistration | null;
  isActive: boolean;
  isControlling: boolean;
}> => {
  const isSupported = 'serviceWorker' in navigator;

  if (!isSupported) {
    return {
      isSupported: false,
      registration: null,
      isActive: false,
      isControlling: false,
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    const isActive = !!(registration?.active);
    const isControlling = !!navigator.serviceWorker.controller;

    return {
      isSupported,
      registration: registration || null, // Fix: Convert undefined to null
      isActive,
      isControlling,
    };
  } catch (error) {
    console.error('Error checking service worker status:', error);
    return {
      isSupported,
      registration: null,
      isActive: false,
      isControlling: false,
    };
  }
};