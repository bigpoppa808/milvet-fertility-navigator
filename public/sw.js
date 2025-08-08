// Service Worker for offline capabilities and performance optimization
// Designed for military environments with potentially unstable connectivity

const CACHE_NAME = 'milvet-fertility-navigator-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  // Add other critical assets
]

// Routes that should work offline
const OFFLINE_ROUTES = [
  '/',
  '/knowledge',
  '/funding',
  '/partners',
  '/dashboard',
  '/auth/login',
  '/auth/register'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching static assets...')
        return cache.addAll(STATIC_ASSETS.filter(url => url))
      }),
      self.skipWaiting()
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      self.clients.claim()
    ])
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip Supabase API calls (handle differently)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(handleSupabaseRequest(request))
    return
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  // Handle static assets
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(handleStaticAssetRequest(request))
    return
  }

  // Default fetch strategy
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request)
    })
  )
})

// Handle navigation requests with network-first, fallback to cache
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Network request failed, trying cache...')
    
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fallback to offline page for navigation
    const offlinePage = await caches.match('/')
    return offlinePage || new Response('Offline - Please check your connection', {
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAssetRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fallback to network
    const networkResponse = await fetch(request)
    
    // Cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Asset request failed:', error)
    throw error
  }
}

// Handle Supabase requests with special offline handling
async function handleSupabaseRequest(request) {
  try {
    const response = await fetch(request)
    
    // Cache GET requests for read operations
    if (request.method === 'GET' && response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      // Cache with a shorter TTL for API responses
      const clonedResponse = response.clone()
      cache.put(request, clonedResponse)
    }
    
    return response
  } catch (error) {
    console.log('Service Worker: Supabase request failed, checking cache...')
    
    // For GET requests, try to serve from cache
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        // Add offline indicator header
        const headers = new Headers(cachedResponse.headers)
        headers.set('X-Served-From-Cache', 'true')
        
        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: headers
        })
      }
    }
    
    // Return network error for non-cached requests
    return new Response(
      JSON.stringify({ 
        error: 'Network unavailable', 
        message: 'This action requires an internet connection' 
      }), 
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Handle queued offline actions
  console.log('Service Worker: Performing background sync...')
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || []
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  )
})