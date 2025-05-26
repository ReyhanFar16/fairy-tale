import StoryApi from "./api.js";
import AuthService from "./auth.js";

// const VAPID_PUBLIC_KEY =
//   "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

async function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribePushNotification() {
  try {
    if (!("serviceWorker" in navigator)) {
      return { error: true, message: "Browser tidak mendukung Service Worker" };
    }

    if (!("PushManager" in window)) {
      return { error: true, message: "Browser tidak mendukung Push API" };
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return { error: true, message: "Izin notifikasi tidak diberikan" };
      }
    }

    console.log("Menunggu service worker ready...");
    const registration = await navigator.serviceWorker.ready;
    console.log("Service worker ready, registrasi:", registration);

    try {
      console.log("Mencoba subscribe ke push service...");
      const vapidPublicKey =
        "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";
      const convertedKey = await urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      console.log("Berhasil subscribe:", subscription);

      const subscriptionJSON = subscription.toJSON();

      const result = await StoryApi.subscribePushNotification({
        endpoint: subscriptionJSON.endpoint,
        keys: subscriptionJSON.keys,
      });

      return { error: false, subscription: subscription };
    } catch (subscribeError) {
      console.error("Error subscribing to push:", subscribeError);
      return {
        error: true,
        message: "Registration failed - push service error",
      };
    }
  } catch (error) {
    console.error("Error dalam subscribePushNotification:", error);
    return {
      error: true,
      message: error.message || "Gagal berlangganan notifikasi",
    };
  }
}

let notificationPreference = {
  enabled: true,
};

async function unsubscribePushNotification() {
  try {
    console.log("Starting unsubscribe process");

    if (!("serviceWorker" in navigator)) {
      return { error: true, message: "Browser tidak mendukung Service Worker" };
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(`Found ${registrations.length} registrations`);

    if (registrations.length === 0) {
      localStorage.setItem("notificationStatus", "false");
      return { error: false, message: "Tidak ada service worker aktif" };
    }

    let unsubscribed = false;

    for (const registration of registrations) {
      try {
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => resolve(null), 2000);
        });

        const subscription = await Promise.race([
          registration.pushManager.getSubscription(),
          timeoutPromise,
        ]);

        if (subscription) {
          await subscription.unsubscribe();
          unsubscribed = true;
          break;
        }
      } catch (err) {
        console.warn("Error unsubscribing from specific registration:", err);
      }
    }

    localStorage.setItem("notificationStatus", "false");

    return {
      error: false,
      message: unsubscribed
        ? "Berhasil berhenti berlangganan"
        : "Tidak ada langganan aktif",
    };
  } catch (error) {
    console.error("Error saat unsubscribe:", error);
    localStorage.setItem("notificationStatus", "false");

    return {
      error: true,
      message: error.message || "Gagal menghapus langganan",
    };
  }
}

async function showLocalNotification(options = {}) {
  if (!notificationPreference.enabled) {
    console.log("Notifikasi dinonaktifkan oleh pengguna");
    return false;
  }

  try {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      console.error(
        "Browser tidak mendukung Service Worker atau Notification API"
      );
      return false;
    }

    if (Notification.permission !== "granted") {
      console.log("Izin notifikasi belum diberikan, meminta izin...");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Izin notifikasi ditolak");
        return false;
      }
    }

    const defaultOptions = {
      title: "Fairy Tale",
      body: "Ada pembaruan baru untuk Anda!",
      icon: "/public/icons/icon-192x192.png",
      badge: "/public/icons/badge-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        url: window.location.origin,
        dateOfArrival: Date.now(),
      },
      actions: [
        {
          action: "open",
          title: "Buka Aplikasi",
        },
      ],
      requireInteraction: true,
    };

    const notificationOptions = { ...defaultOptions, ...options };

    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(notificationOptions.title, {
      body: notificationOptions.body,
      icon: notificationOptions.icon,
      badge: notificationOptions.badge,
      vibrate: notificationOptions.vibrate,
      data: notificationOptions.data,
      actions: notificationOptions.actions,
      requireInteraction: notificationOptions.requireInteraction,
      tag: notificationOptions.tag || "fairy-tale-notification",
      renotify: notificationOptions.renotify || false,
      silent: notificationOptions.silent || false,
    });

    console.log("Notifikasi berhasil ditampilkan");
    return true;
  } catch (error) {
    console.error("Error menampilkan notifikasi:", error);
    return false;
  }
}

function isNotificationEnabled() {
  return notificationPreference.enabled;
}

export {
  subscribePushNotification,
  unsubscribePushNotification,
  showLocalNotification,
  isNotificationEnabled,
};
