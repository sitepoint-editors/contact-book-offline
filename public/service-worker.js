let CACHE_NAME = 'contact-book-v1';

let resourcesToCache = [
    '/',
    '/css/style.css',
    '/js/ext/babel.min.js',
    '/js/ext/pouchdb.min.js',
    '/js/register-service-worker.js',
    '/js/store.js',
    '/js/app.js'
];

self.addEventListener('install', function(event) {
    console.info('installing service worker');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.info('cache opened');

                return cache.addAll(resourcesToCache);
            })
    );
});

self.addEventListener('activate', function(event) {
    console.info('service worker activated');
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                console.log('request:', event.request);

                if (response) {
                    console.info('cache hit');
                    return response;
                }

                console.info('fetching');
                return fetch(event.request);
            })
    );
});