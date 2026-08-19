/// <reference lib="webworker" />
import type { PrecacheEntry } from "serwist";
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: PrecacheEntry[];
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// Dynamic Next.js responses must not be served from a stale service-worker
// cache. Otherwise a deployment can briefly mix old RSC/HTML with new client
// bundles and surface a client-side exception until the page is reloaded.
self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);
  const isNextDynamicRequest =
    request.mode === "navigate" ||
    request.destination === "document" ||
    request.headers.has("RSC") ||
    request.headers.has("Next-Router-Prefetch") ||
    request.headers.has("Next-Router-State-Tree") ||
    request.headers.has("Next-Url") ||
    url.pathname.startsWith("/api/auth/");

  // Server Actions and form submissions must never be handled by Serwist.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  if (isNextDynamicRequest) {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(async () => {
        const offlineResponse = await caches.match("/offline");
        if (offlineResponse) {
          return offlineResponse;
        }
        throw new Error("Network unavailable and offline fallback is missing");
      }),
    );
  }
});

serwist.addEventListeners();
