const CACHE_NAME = "fittracker-v2"
const STATIC_CACHE = "fittracker-static-v2"
const DYNAMIC_CACHE = "fittracker-dynamic-v2"

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/log-workout",
  "/progress",
  "/manifest.json",
  // Add other critical assets here
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Service Worker: Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("Service Worker: Skip waiting")
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Claiming clients")
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith("http")) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        console.log("Service Worker: Serving from cache", event.request.url)
        return cachedResponse
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Add to dynamic cache
          caches.open(DYNAMIC_CACHE).then((cache) => {
            console.log("Service Worker: Caching dynamic asset", event.request.url)
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/")
          }
        })
    }),
  )
})

// Background sync for offline workout data
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event.tag)

  if (event.tag === "workout-sync") {
    event.waitUntil(syncWorkoutData())
  }
})

// Sync workout data when back online
async function syncWorkoutData() {
  try {
    // Get pending workouts from IndexedDB
    const pendingWorkouts = await getPendingWorkouts()

    for (const workout of pendingWorkouts) {
      try {
        // Attempt to sync each workout
        await fetch("/api/workouts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(workout),
        })

        // Remove from pending if successful
        await removePendingWorkout(workout.id)
        console.log("Service Worker: Synced workout", workout.id)
      } catch (error) {
        console.error("Service Worker: Failed to sync workout", workout.id, error)
      }
    }
  } catch (error) {
    console.error("Service Worker: Background sync failed", error)
  }
}

// IndexedDB helpers (simplified)
async function getPendingWorkouts() {
  // Implementation would use IndexedDB to get pending workouts
  return []
}

async function removePendingWorkout(workoutId) {
  // Implementation would remove workout from IndexedDB
  console.log("Removing pending workout:", workoutId)
}

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push received")

  const options = {
    body: event.data ? event.data.text() : "Time for your workout!",
    icon: "/fittracker-notification-icon.png",
    badge: "/fittracker-badge-icon.png",
    vibrate: [200, 100, 200],
    data: {
      url: "/",
    },
    actions: [
      {
        action: "log-workout",
        title: "Log Workout",
        icon: "/plus-icon.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/close-icon.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("FitTracker", options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked", event.action)

  event.notification.close()

  if (event.action === "log-workout") {
    event.waitUntil(clients.openWindow("/log-workout"))
  } else if (event.action === "dismiss") {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/"))
  }
})
