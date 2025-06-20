import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

// This declares the value of `self.SW_VERSION` to TypeScript
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    SW_VERSION: string;
    __SW_MANIFEST: (string | PrecacheEntry)[];
  }
}

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (string | PrecacheEntry)[];
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\/tools.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'tools-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();