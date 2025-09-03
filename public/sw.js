// public/sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  clients.claim();
});
// passthrough; no caching
self.addEventListener('fetch', () => {});
