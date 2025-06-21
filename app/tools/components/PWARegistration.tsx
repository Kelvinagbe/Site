"use client";

import { useEffect, useState } from 'react';

export default function PWARegistration() {
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && !isRegistered) {
      // Check if already registered
      navigator.serviceWorker.getRegistrations().then(registrations => {
        const existingRegistration = registrations.find(reg => 
          reg.scope.includes('/tools')
        );
        
        if (existingRegistration) {
          console.log('🔧 PWA already registered for /tools');
          setIsRegistered(true);
          return;
        }

        // Only register if not already registered
        navigator.serviceWorker.register('/sw.js', {
          scope: '/tools'
        }).then((registration) => {
          console.log('🔧 PWA registered for /tools:', registration);
          setIsRegistered(true);
        }).catch((registrationError) => {
          console.log('❌ PWA registration failed:', registrationError);
        });
      });
    }
  }, [isRegistered]);

  return null;
}