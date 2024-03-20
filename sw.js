
const serviceWorker = 'cacheSW';
self.addEventListener('install', function(e) {
    const cachePromise = caches.open(serviceWorker).then(cache => {
        return cache.addAll([
            './app.js',
            './index.html',
            './CSS/estilos.css',
            './sw.js',
            
            'https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js',
            'https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css',
            'https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.js',
        ]);
    });
    e.waitUntil(cachePromise);
});

// aplicando cache first
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            
            return fetch(event.request).then((fetchedResponse) => {
                const cacheCopy = fetchedResponse.clone();
                caches.open(serviceWorker).then((cache) => {
                    cache.put(event.request, cacheCopy);
                });

                return fetchedResponse;
            });
        })
    );
});

