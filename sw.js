// WW Pro-Calc — Service Worker
// Version: v9.52
// Place this file at the ROOT of your GitHub Pages repo (same level as index.html)
// It will be served at: https://frazier6.github.io/sw.js

const CACHE_NAME = 'ww-pro-calc-v9.52';

// Files to cache on install (pre-cache the app shell)
const PRECACHE_URLS = [
    './',
    './index.html'
];

// ── Install: pre-cache the app ──────────────────────────────────
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(PRECACHE_URLS);
        }).then(function() {
            return self.skipWaiting(); // activate immediately
        })
    );
});

// ── Activate: clean up old caches ──────────────────────────────
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(function(name) { return name !== CACHE_NAME; })
                    .map(function(name) { return caches.delete(name); })
            );
        }).then(function() {
            return self.clients.claim(); // take control immediately
        })
    );
});

// ── Fetch: cache-first for the app, network-only for the API ───
self.addEventListener('fetch', function(event) {
    var url = event.request.url;

    // Never intercept Anthropic API calls — let them go to network
    if (url.indexOf('api.anthropic.com') !== -1) {
        return; // browser handles it normally
    }

    // For navigation requests (loading the page) — cache first
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.match(event.request).then(function(cached) {
                if (cached) {
                    // Serve from cache, then update cache in background
                    var fetchPromise = fetch(event.request).then(function(response) {
                        if (response && response.status === 200) {
                            var clone = response.clone();
                            caches.open(CACHE_NAME).then(function(cache) {
                                cache.put(event.request, clone);
                            });
                        }
                        return response;
                    }).catch(function() { /* offline — already served from cache */ });
                    return cached;
                }
                // Not in cache — fetch from network
                return fetch(event.request).then(function(response) {
                    if (response && response.status === 200) {
                        var clone = response.clone();
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(event.request, clone);
                        });
                    }
                    return response;
                });
            })
        );
        return;
    }

    // For all other requests — cache first, network fallback
    event.respondWith(
        caches.match(event.request).then(function(cached) {
            if (cached) return cached;
            return fetch(event.request).then(function(response) {
                if (!response || response.status !== 200 || response.type === 'opaque') {
                    return response;
                }
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, clone);
                });
                return response;
            }).catch(function() {
                // Offline and not in cache — return nothing (404-like)
                return new Response('Offline', { status: 503 });
            });
        })
    );
});

// ── Message handler: force update on demand ─────────────────────
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
