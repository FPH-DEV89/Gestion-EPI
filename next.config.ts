import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // reactCompiler: true, // Désactivé pour stabilité build VPS
  // node-cron dépend de modules Node natifs (path, child_process...) : on
  // l'exclut du bundling webpack pour instrumentation.ts (scheduler interne).
  serverExternalPackages: ['node-cron'],
};

export default withSerwist(nextConfig);
