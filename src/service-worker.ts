/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'PikPak'

self.addEventListener('install', (e: any) => {
  console.log('install', e)

  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // cache.addAll([
      //   '/favicon-16x16.png',
      //   '/favicon-32x32.png',
      //   '/android-chrome-192x192.png',
      //   '/android-chrome-512x512.png',
      //   '/apple-touch-icon.png',
      //   '/favicon.ico',
      // ])
      self.skipWaiting()
    }),
  )
})

self.addEventListener('fetch', (e: any) => {
  e.respondWith((async () => {
    const matchCache = await caches.match(e.request)
    if (matchCache) {
      return matchCache
    }

    const resp = await fetch(e.request)
    const url = e?.request?.url
    if (url?.includes('.mkv') || url?.includes('.mp4')) {
      console.log('request', resp.clone().arrayBuffer().then(res => console.log(res)))
    }
    return resp
  })())
})
