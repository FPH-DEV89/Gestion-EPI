/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: any;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

// CRITICAL: Bypass Serwist entirely for all non-GET requests.
// A bare `return` (no respondWith) still lets Serwist's listener run and
// return a `no-response` network error for Server Actions and form POSTs.
// By calling event.respondWith(fetch(...)) we claim the event first so
// Serwist cannot intercept POST / PUT / DELETE / PATCH requests.
self.addEventListener("fetch", (event: any) => {
  if (event.request.method !== "GET") {
    event.respondWith(fetch(event.request));
    return;
  }
});

serwist.addEventListeners();
