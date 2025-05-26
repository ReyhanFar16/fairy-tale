import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

// Precharge asset yang diinjeksi oleh workbox-webpack-plugin
precacheAndRoute(self.__WB_MANIFEST);

// Event saat service worker diinstal
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  self.skipWaiting();
});

// Event saat service worker diaktifkan
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  event.waitUntil(clients.claim());
});

// Cache API requests
registerRoute(
  ({ url }) => url.origin === "https://story-api.dicoding.dev",
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1 jam
      }),
    ],
  })
);

// Cache gambar dengan strategi Cache First
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "image-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      }),
    ],
  })
);

// Event push notification
self.addEventListener("push", (event) => {
  console.log("Push notification received", event);

  let notificationData = {
    title: "Fairy Tale",
    body: "Ada cerita baru untukmu!",
    icon: "/icon.png",
  };

  try {
    if (event.data) {
      notificationData = { ...notificationData, ...event.data.json() };
    }
  } catch (error) {
    console.error("Error parsing notification data", error);
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: "/badge.png",
    })
  );
});

// Event notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked", event);
  event.notification.close();

  event.waitUntil(clients.openWindow("/"));
});
