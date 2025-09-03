// public/sw.js
// Minimal SW: just makes the app installable.
// No offline caching (everything passes through).

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => { /* passthrough */ });
