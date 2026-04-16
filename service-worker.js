// WW Pro-Calc Service Worker
// AUTO-VERSIONING: No manual bumps needed. The SW reads the app version
// from the HTML response and rebuilds the cache whenever it changes.
// Deploy this file ONCE and never touch it again.

const SW_META_KEY = 'ww-pro-calc-sw-meta';
const CACHE_PREFIX = 'ww-pro-calc-';

// Files to cache on install (static shell)
const CORE_FILES = [
  './Pro-3-19.html',
  './manifest.json'
];

// --- Install: cache core files ---
self.addEventListener('install', function(event) {
  // Activate immediately, don't wait for old SW to die
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then(function(keys) {
      // Just pre-warm — actual versioned cache built on fetch
      return Promise.resolve();
    })
  );
});

// --- Activate: claim clients and clean old caches ---
self.addEventListener('activate', function(event) {
  event.waitUntil(
    clients.claim().then(function() {
      return caches.keys();
    }).then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          // Delete ALL old ww-pro-calc caches on activate
          return key.startsWith(CACHE_PREFIX);
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    })
  );
});

// --- Fetch: network-first for HTML, cache-first for everything else ---
self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // Only handle same-origin requests
  if (!url.startsWith(self.location.origin)) return;

  // For the main HTML file: always network-first
  // This ensures we always get the latest version
  if (url.includes('Pro-3-19.html') || url === self.location.origin + '/' || url === self.location.origin + '/ww-pro-calc/') {
    event.respondWith(networkFirstHTML(event.request));
    return;
  }

  // For manifest and other files: cache-first
  if (url.includes('manifest.json') || url.includes('icon-') || url.includes('favicon')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Everything else: network only (API calls, etc.)
});

// Network-first for HTML: fetches fresh copy, extracts version,
// rebuilds cache if version changed
function networkFirstHTML(request) {
  return fetch(request.clone(), { cache: 'no-store' }).then(function(networkResponse) {
    if (!networkResponse || !networkResponse.ok) {
      throw new Error('Network response not ok');
    }

    // Clone response to read body AND cache it
    var responseToCache = networkResponse.clone();
    var responseToRead = networkResponse.clone();

    // Read the HTML to extract version string
    return responseToRead.text().then(function(html) {
      // Extract currentVersion from the JS in the HTML
      // Matches: var currentVersion = 'v9.73'  or  currentVersion = "v9.73"
      var versionMatch = html.match(/var\s+currentVersion\s*=\s*['"]([^'"]+)['"]/);
      if (!versionMatch) {
        // Fallback: just cache with timestamp
        versionMatch = [null, 'ts-' + Date.now()];
      }
      var version = versionMatch[1];
      var cacheName = CACHE_PREFIX + version;

      return caches.keys().then(function(existingKeys) {
        var currentCacheExists = existingKeys.includes(cacheName);

        // Delete old ww-pro-calc caches that aren't the new version
        var deleteOld = Promise.all(
          existingKeys.filter(function(k) {
            return k.startsWith(CACHE_PREFIX) && k !== cacheName;
          }).map(function(k) {
            return caches.delete(k);
          })
        );

        return deleteOld.then(function() {
          // Cache the fresh response
          return caches.open(cacheName).then(function(cache) {
            cache.put(request, responseToCache);
          });
        });
      });
    }).then(function() {
      // Return the original network response
      return networkResponse;
    });

  }).catch(function() {
    // Network failed — serve from any available ww-pro-calc cache
    return caches.keys().then(function(keys) {
      var ourKeys = keys.filter(function(k) { return k.startsWith(CACHE_PREFIX); });
      if (ourKeys.length === 0) return caches.match(request);
      return caches.open(ourKeys[ourKeys.length - 1]).then(function(cache) {
        return cache.match(request).then(function(cached) {
          return cached || fetch(request);
        });
      });
    });
  });
}

// Cache-first for static assets
function cacheFirst(request) {
  return caches.match(request).then(function(cached) {
    if (cached) return cached;
    return fetch(request).then(function(response) {
      if (response && response.ok) {
        // Find current cache to store in
        return caches.keys().then(function(keys) {
          var ourKeys = keys.filter(function(k) { return k.startsWith(CACHE_PREFIX); });
          var cacheName = ourKeys.length > 0 ? ourKeys[ourKeys.length - 1] : CACHE_PREFIX + 'static';
          return caches.open(cacheName).then(function(cache) {
            cache.put(request, response.clone());
            return response;
          });
        });
      }
      return response;
    });
  });
}
