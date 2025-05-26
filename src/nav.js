import {
  subscribePushNotification,
  unsubscribePushNotification,
  isNotificationEnabled,
} from "./utils/notification-helper.js";

// Simpan state notifikasi untuk dipertahankan antar navigasi
let notificationState = {
  isActive:
    localStorage.getItem("notificationStatus") === "true" ? true : false,
  pendingOperation: false,
};

// Fungsi untuk memperbarui UI navigasi
function updateAuthUI() {
  const navMenu = document.getElementById("nav-menu");

  if (window.AuthService && window.AuthService.isLoggedIn()) {
    navMenu.innerHTML = `
        <li class="notification-item"></li>
        <li><a href="#/" class="nav-link">Home</a></li>
        <li><a href="#/add" class="nav-link">Add Story</a></li>
        <li><a href="#/stories" class="nav-link">Stories</a></li>
        <li><a href="#/map" class="nav-link">Map</a></li>
        <li><a href="#/favorites" class="nav-link">Favorites</a></li>
        <li>
          <a href="#" class="nav-link" id="logout-link">Logout</a>
        </li>
      `;

    // Tambahkan tombol notifikasi di container khusus
    addNotificationButton();

    document.getElementById("logout-link").addEventListener("click", (e) => {
      e.preventDefault();
      window.AuthService.logout();
      window.location.hash = "#/";
      updateAuthUI();
    });
  } else {
    navMenu.innerHTML = `
        <li><a href="#/register" class="nav-link">Register</a></li>
        <li><a href="#/login" class="nav-link">Login</a></li>
      `;
  }
}

// Fungsi untuk menambahkan tombol notifikasi
function addNotificationButton() {
  console.log("Adding notification button");
  const notificationContainer = document.querySelector(".notification-item");

  if (!notificationContainer) {
    console.error("Notification container not found");
    return;
  }

  // Buat tombol notifikasi dengan status awal loading
  const notificationButton = document.createElement("button");
  notificationButton.id = "notification-button";
  notificationButton.className = "notification-btn";
  notificationButton.textContent = "Memuat...";
  notificationButton.disabled = true;

  // Tambahkan ke container
  notificationContainer.appendChild(notificationButton);

  // Fungsi untuk memperbarui tampilan tombol berdasarkan state
  function updateButtonState() {
    console.log("Updating button state, active:", notificationState.isActive);

    if (notificationState.pendingOperation) {
      notificationButton.disabled = true;
      notificationButton.textContent = "Memproses...";
      return;
    }

    if (notificationState.isActive) {
      notificationButton.textContent = "Nonaktifkan";
      notificationButton.classList.add("danger");
      notificationButton.classList.remove("success");
    } else {
      notificationButton.textContent = "Aktifkan Notifikasi";
      notificationButton.classList.remove("danger", "success");
    }

    notificationButton.disabled = false;
  }

  // Event handler yang dipanggil saat tombol diklik
  async function handleNotificationButtonClick() {
    console.log(
      "Notification button clicked, current state:",
      notificationState.isActive
    );

    // Jika sedang proses, abaikan klik
    if (notificationState.pendingOperation) return;

    notificationState.pendingOperation = true;
    updateButtonState();

    try {
      if (notificationState.isActive) {
        // Nonaktifkan
        console.log("Trying to unsubscribe...");
        const result = await unsubscribePushNotification();

        if (result.error) {
          alert(`Error: ${result.message}`);
        } else {
          alert("Berhasil berhenti berlangganan notifikasi");
          notificationState.isActive = false;
          localStorage.setItem("notificationStatus", "false");
        }
      } else {
        // Aktifkan
        console.log("Trying to subscribe...");
        const result = await subscribePushNotification();

        if (result.error) {
          alert(`Error: ${result.message}`);
        } else {
          notificationState.isActive = true;
          localStorage.setItem("notificationStatus", "true"); // Tambahkan ini
          alert("Notifikasi berhasil diaktifkan!");
        }
      }
    } catch (error) {
      console.error("Error processing notification:", error);
      alert("Terjadi kesalahan saat memproses notifikasi");
    } finally {
      notificationState.pendingOperation = false;
      updateButtonState();
    }
  }

  // Tambahkan event listener untuk klik tombol
  notificationButton.addEventListener("click", handleNotificationButtonClick);

  // Periksa status notifikasi dan perbarui tampilan tombol
  checkCurrentNotificationStatus().then(() => {
    updateButtonState();
  });
}

// Fungsi untuk memeriksa status notifikasi saat ini
async function checkCurrentNotificationStatus() {
  console.log("Checking current notification status...");

  try {
    // Periksa localStorage terlebih dahulu untuk performa
    const savedStatus = localStorage.getItem("notificationStatus");
    console.log("Status from localStorage:", savedStatus);

    if (savedStatus === "false") {
      notificationState.isActive = false;
      return;
    }

    // Jika tidak ada status yang disimpan atau statusnya true,
    // periksa subscription aktual di browser
    const isSubscribed = await checkNotificationSubscriptionStatus();
    console.log("Actual subscription status:", isSubscribed);

    // Update state dan localStorage
    notificationState.isActive = isSubscribed;
    localStorage.setItem("notificationStatus", isSubscribed ? "true" : "false");
  } catch (error) {
    console.error("Error checking notification status:", error);
    notificationState.isActive = false;
  }
}

// Fungsi untuk memeriksa status subscription di browser
async function checkNotificationSubscriptionStatus() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return false;
    }

    // Add a timeout promise to prevent indefinite waiting
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve(null), 3000); // 3 second timeout
    });

    // Use Promise.race to implement a timeout
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      timeoutPromise,
    ]);

    // If timeout won or registration failed, return false
    if (!registration) {
      console.warn("Service worker registration timed out or failed");
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error("Error checking push subscription:", error);
    return false;
  }
}

// Panggil updateAuthUI saat DOM siap
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing UI");
  updateAuthUI();
});

// PENTING: Tambahkan listener untuk perubahan hash (navigasi SPA)
window.addEventListener("hashchange", () => {
  console.log("Hash changed, updating UI");
  updateAuthUI();
});

// Tambahkan style untuk tombol notifikasi
const style = document.createElement("style");
style.textContent = `
  .notification-btn {
    padding: 5px 10px;
    margin-right: 10px;
    background-color: #6b7280;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  .notification-btn.success {
    background-color: #10b981;
  }
  .notification-btn.danger {
    background-color: #ef4444;
  }
  .notification-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  .notification-item {
    display: flex;
    align-items: center;
  }
`;
document.head.appendChild(style);
