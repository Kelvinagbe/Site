"use client";

import { useEffect, useState } from 'react';

export default function PWARegistration() {
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const registerPWA = async () => {
      // Only run once and only on client side
      if (!('serviceWorker' in navigator) || isRegistered || typeof window === 'undefined') {
        return;
      }

      try {
        // Check if PWA service worker is already registered
        const registrations = await navigator.serviceWorker.getRegistrations();
        const existingPWARegistration = registrations.find(reg => 
          reg.scope.includes('/tools') && 
          reg.active?.scriptURL.includes('sw.js')
        );

        if (existingPWARegistration) {
          console.log('🔧 PWA Service Worker already registered');
          setIsRegistered(true);
          return;
        }

        // Register only the PWA service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/tools'
        });

        console.log('🔧 PWA Service Worker registered successfully:', registration);
        setIsRegistered(true);

        // Optional: Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('🔧 PWA Service Worker update found');
        });

      } catch (error) {
        console.error('❌ PWA Service Worker registration failed:', error);
      }
    };

    registerPWA();
  }, [isRegistered]);

  return null;
}