import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, CacheFirst } from 'serwist';

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
      handler: new CacheFirst({
        cacheName: 'tools-cache',
        plugins: [
          {
            cacheKeyWillBeUsed: async ({ request }) => {
              return `${request.url}?${Date.now()}`;
            },
          },
          {
            cacheWillUpdate: async ({ response }) => {
              return response.status === 200 ? response : null;
            },
          },
        ],
        networkTimeoutSeconds: 3,
        cacheName: 'tools-cache',
        matchOptions: {
          ignoreSearch: false,
        },
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();