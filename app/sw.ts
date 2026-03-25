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

// CRITICAL: Prevent BackgroundSync from crashing Next.js Server Actions
self.addEventListener("fetch", (event: any) => {
  if (event.request.headers.get("Next-Action")) {
    return;
  }
});

serwist.addEventListeners();
