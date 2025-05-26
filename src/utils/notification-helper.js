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

// Perbaikan fungsi unsubscribe
async function unsubscribePushNotification() {
  try {
    console.log("Starting unsubscribe process");

    if (!("serviceWorker" in navigator)) {
      return { error: true, message: "Browser tidak mendukung Service Worker" };
    }

    // Gunakan getRegistrations untuk mendapatkan semua registrasi
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(`Found ${registrations.length} registrations`);

    if (registrations.length === 0) {
      // Tidak ada registrasi, anggap berhasil unsubscribe
      localStorage.setItem("notificationStatus", "false");
      return { error: false, message: "Tidak ada service worker aktif" };
    }

    let unsubscribed = false;

    // Coba setiap registrasi
    for (const registration of registrations) {
      try {
        // Gunakan timeout untuk menghindari hanging
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

    // Selalu update status di localStorage, bahkan jika ada error
    localStorage.setItem("notificationStatus", "false");

    return {
      error: false,
      message: unsubscribed
        ? "Berhasil berhenti berlangganan"
        : "Tidak ada langganan aktif",
    };
  } catch (error) {
    console.error("Error saat unsubscribe:", error);
    // Selalu update status di localStorage, bahkan jika ada error
    localStorage.setItem("notificationStatus", "false");

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
