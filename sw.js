const CACHE_VERSION = '1.1.0';
const CACHE_NAME = `40k-army-cleaner-v${CACHE_VERSION}`;
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './app.js',
    './roster-cleaner.js',
    './manifest.json',
    'https://cdn.tailwindcss.com'
];

// Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('install', (event) => {
    console.log('Service Worker installing with cache:', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
            .then(() => {
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
    );
});

self.addEventListener('fetch', (event) => {
    // For HTML files, try network first, then cache
    if (event.request.url.includes('.html') || event.request.url.endsWith('/')) {
        event.respondWith(
            fetch(event.request)
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
    } else {
        // For other assets, use cache first with network fallback
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        // Return cached version immediately
                        return response;
                    }
                    // Fetch from network if not in cache
                    return fetch(event.request);
                })
        );
    }
});

// Handle service worker updates
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
}); 