import { defaultCache } from "@/lib/service-worker/cache"

declare const self: ServiceWorkerGlobalScope

// Create a unique cache name for this deployment
const CACHE = `app-cache-${self.registration.scope}`

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(defaultCache)
    }),
  )
})

self.addEventListener("activate", (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE) {
            return caches.delete(key)
          }
        }),
      )
    }),
  )
})

self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/offline")
      }),
    )
    return
  }

  // For other requests, try the network first, then the cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache responses with errors
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and because we want the browser to consume the response
        // as well as the cache consuming the response, we need
        // to clone it so we have two streams.
        const responseToCache = response.clone()

        caches.open(CACHE).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
      .catch(() => {
        return caches.match(event.request)
      }),
  )
})

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// Listen to push notifications
self.addEventListener("push", (event) => {
  const data = JSON.parse(event.data.text())

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: "/icons/icon-192x192.png",
    }),
  )
})
