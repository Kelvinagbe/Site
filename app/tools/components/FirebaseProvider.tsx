// components/FirebaseProvider.tsx
'use client';

import { useEffect, ReactNode } from 'react';

interface FirebaseProviderProps {
  children: ReactNode;
}

export default function FirebaseProvider({ children }: FirebaseProviderProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration: ServiceWorkerRegistration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error: Error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  return <>{children}</>;
}