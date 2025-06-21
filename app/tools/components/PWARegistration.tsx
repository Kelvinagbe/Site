"use client";

import { useEffect, useState } from 'react';

export default function PWARegistration() {
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const registerServiceWorkers = async () => {
      if (!('serviceWorker' in navigator) || isRegistered) {
        return;
      }

      try {
        // Check if any service workers are already registered
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        // Check for existing Firebase messaging service worker
        const existingFirebaseRegistration = registrations.find(reg => 
          reg.scope.includes('/') && 
          (reg.active?.scriptURL.includes('firebase-messaging-sw') || 
           reg.installing?.scriptURL.includes('firebase-messaging-sw') ||
           reg.waiting?.scriptURL.includes('firebase-messaging-sw'))
        );

        // Check for existing PWA service worker
        const existingPWARegistration = registrations.find(reg => 
          reg.scope.includes('/tools') &&
          (reg.active?.scriptURL.includes('sw.js') ||
           reg.installing?.scriptURL.includes('sw.js') ||
           reg.waiting?.scriptURL.includes('sw.js'))
        );

        let firebaseRegistered = !!existingFirebaseRegistration;
        let pwaRegistered = !!existingPWARegistration;

        // Register Firebase messaging service worker if not already registered
        if (!firebaseRegistered) {
          try {
            // First try the API route (your current setup)
            const firebaseRegistration = await navigator.serviceWorker.register('/api/firebase-messaging-sw', {
              scope: '/'
            });
            console.log('🔥 Firebase Service Worker registered via API route:', firebaseRegistration);
            firebaseRegistered = true;
          } catch (error) {
            console.log('API route registration failed, trying static file:', error);
            // Fallback to static file if API route fails
            try {
              const firebaseRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/'
              });
              console.log('🔥 Firebase Service Worker registered via static file:', firebaseRegistration);
              firebaseRegistered = true;
            } catch (staticError) {
              console.error('Both Firebase service worker registration methods failed:', staticError);
            }
          }
        } else {
          console.log('🔥 Firebase Service Worker already registered');
        }

        // Register PWA service worker if not already registered
        if (!pwaRegistered) {
          const pwaRegistration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/tools'
          });
          console.log('🔧 PWA Service Worker registered for /tools:', pwaRegistration);
          pwaRegistered = true;
        } else {
          console.log('🔧 PWA Service Worker already registered for /tools');
        }

        // Mark as registered if at least one succeeded
        if (firebaseRegistered || pwaRegistered) {
          setIsRegistered(true);
        }

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    };

    registerServiceWorkers();
  }, [isRegistered]);

  return null; // This component doesn't render anything
}