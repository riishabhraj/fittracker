const CACHE_VERSION = "fittracker-v3"
const STATIC_CACHE = "fittracker-static-v3"
const DYNAMIC_CACHE = "fittracker-dynamic-v3"
const ALL_CACHES = [STATIC_CACHE, DYNAMIC_CACHE]

// Only cache these stable public assets
const STATIC_ASSETS = [
  "/manifest.json",
  "/fittracker-app-icon.png",
  "/icon-192.png",
  "/icon-512.png",
]

// Install — cache only stable static assets, skip waiting immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate — delete every cache not in the current version list
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (!ALL_CACHES.includes(key)) {
              return caches.delete(key)
            }
          })
        )
      )
      .then(() => self.clients.claim())
  )
})

// Fetch — smart strategy per request type
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return
  if (!event.request.url.startsWith("http")) return

  const url = new URL(event.request.url)

  // 1. Never intercept Next.js build artifacts or HMR — always go to network.
  //    This prevents stale webpack chunks and hot-update 404s.
  if (url.pathname.startsWith("/_next/")) return

  // 2. Never intercept .well-known, chrome-extension probes, etc.
  if (url.pathname.startsWith("/.well-known/")) return

  // 3. Navigation requests (HTML pages) — network-first, fall back to cache
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone))
          return response
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
    )
    return
  }

  // 4. Static assets (icons, manifest) — cache-first, update in background
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      return cached || networkFetch
    })
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
