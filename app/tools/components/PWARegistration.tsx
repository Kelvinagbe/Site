"use client";

import { useEffect } from 'react';

export default function PWARegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/tools'
      }).then((registration) => {
        console.log('🔧 PWA registered for /tools:', registration);
      }).catch((registrationError) => {
        console.log('❌ PWA registration failed:', registrationError);
      });
    }
  }, []);

  return null; // This component doesn't render anything
}