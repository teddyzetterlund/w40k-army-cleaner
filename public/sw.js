const CACHE_VERSION = '1.1.0';
const CACHE_NAME = `40k-army-cleaner-v${CACHE_VERSION}`;

// Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Claim all clients immediately
            return self.clients.claim();
        })
    );
});

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // Cache the main page and critical assets
                return cache.addAll([
                    './',
                    './index.html',
                    './about.html',
                    './install.html'
                ]);
            })
            .then(() => {
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
    );
});

self.addEventListener('fetch', (event) => {
    // For all files, try network first to ensure fresh content
    event.respondWith(
        fetch(event.request, { 
            cache: 'no-cache' // Force bypass browser cache
        })
            .then((response) => {
                // Cache the fresh response
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Fallback to cache if network fails
                return caches.match(event.request);
            })
    );
});

// Handle service worker updates
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
}); 