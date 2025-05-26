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

    // Cek permission notifikasi terlebih dahulu
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return { error: true, message: "Izin notifikasi tidak diberikan" };
      }
    }

    // Tunggu service worker registration
    console.log("Menunggu service worker ready...");
    const registration = await navigator.serviceWorker.ready;
    console.log("Service worker ready, registrasi:", registration);

    try {
      // Coba subscribe ke push service
      console.log("Mencoba subscribe ke push service...");
      const vapidPublicKey =
        "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";
      const convertedKey = await urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      console.log("Berhasil subscribe:", subscription);

      // Kirim ke server
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

// Perbarui fungsi unsubscribe
async function unsubscribePushNotification() {
  try {
    if (!("serviceWorker" in navigator)) {
      return { error: true, message: "Browser tidak mendukung Service Worker" };
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Update preference dan localStorage
      notificationPreference.enabled = false;
      localStorage.setItem("notificationStatus", "false");
      return { error: false, message: "Tidak ada langganan aktif" };
    }

    try {
      // Hapus subscription dari push service
      await subscription.unsubscribe();

      // Kirim ke server jika tersedia
      try {
        await StoryApi.unsubscribePushNotification({
          endpoint: subscription.endpoint,
        });
      } catch (serverError) {
        console.warn("Server unsubscribe error:", serverError);
        // Lanjutkan meskipun server error
      }

      // Set preference untuk menonaktifkan semua notifikasi
      notificationPreference.enabled = false;
      localStorage.setItem("notificationStatus", "false");

      return { error: false, message: "Berhasil berhenti berlangganan" };
    } catch (error) {
      return {
        error: true,
        message: error.message || "Gagal berhenti berlangganan",
      };
    }
  } catch (error) {
    console.error("Error saat unsubscribe:", error);
    return {
      error: true,
      message: error.message || "Gagal menghapus langganan",
    };
  }
}

// Perbarui fungsi showLocalNotification
async function showLocalNotification(options = {}) {
  // Tambahkan pengecekan preference
  if (!notificationPreference.enabled) {
    console.log("Notifikasi dinonaktifkan oleh pengguna");
    return false;
  }

  try {
    // Kode yang sudah ada...
  } catch (error) {
    // ...
  }
}

// Tambahkan fungsi untuk memeriksa preferensi
function isNotificationEnabled() {
  return notificationPreference.enabled;
}

export {
  subscribePushNotification,
  unsubscribePushNotification,
  showLocalNotification,
  isNotificationEnabled,
};
