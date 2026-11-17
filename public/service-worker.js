/*
 * Legacy service worker cleanup.
 *
 * The Vue 2 build registered `/service-worker.js` (see the `pre-vue3` tag).
 * The Vue 3 build registers `/sw.js` instead. If the new app is deployed to the
 * same origin, browsers that still have the old worker installed keep serving
 * the cached Vue 2 shell, so the new index.html is never fetched.
 *
 * The old page still calls `register('/service-worker.js')` on every boot, which
 * fetches this file. Because its bytes differ from the old worker, the browser
 * installs it, and it then removes the old caches and unregisters itself. The
 * next navigation loads fresh assets and the Vue 3 app takes over with `/sw.js`.
 *
 * On a brand-new origin this worker is never registered and is inert.
 */

self.addEventListener('install', () => {
    self.skipWaiting()
})

self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys()
            await Promise.all(
                keys.map(key => caches.delete(key).catch(() => false)),
            )
            await self.registration.unregister()
            const clients = await self.clients.matchAll({ type: 'window' })
            for (const client of clients) {
                client.navigate(client.url).catch(() => {})
            }
        })(),
    )
})
