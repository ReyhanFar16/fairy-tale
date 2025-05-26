import {
  subscribePushNotification,
  unsubscribePushNotification,
  isNotificationEnabled,
} from "./utils/notification-helper.js";

let notificationState = {
  isActive:
    localStorage.getItem("notificationStatus") === "true" ? true : false,
  pendingOperation: false,
};

let isMobileMenuOpen = false;

function updateAuthUI() {
  const navMenu = document.getElementById("nav-menu");

  if (!navMenu) {
    console.error("Navigation menu element not found");
    return;
  }

  if (window.AuthService && window.AuthService.isLoggedIn()) {
    navMenu.innerHTML = `
      <li class="notification-item"></li>
      <li><a href="#/" class="nav-link">Home</a></li>
      <li><a href="#/add" class="nav-link">Add Story</a></li>
      <li><a href="#/stories" class="nav-link">Stories</a></li>
      <li><a href="#/map" class="nav-link">Map</a></li>
      <li><a href="#/favorites" class="nav-link">Favorites</a></li>
      <li><a href="#" class="nav-link" id="logout-link">Logout</a></li>
    `;

    addNotificationButton();

    document.getElementById("logout-link")?.addEventListener("click", (e) => {
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

  const header = document.querySelector(".header-content");
  if (header && !document.querySelector(".hamburger-menu")) {
    const hamburgerButton = document.createElement("button");
    hamburgerButton.className = "hamburger-menu";
    hamburgerButton.setAttribute("aria-label", "Toggle menu");
    hamburgerButton.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;

    header.appendChild(hamburgerButton);

    hamburgerButton.addEventListener("click", () => {
      isMobileMenuOpen = !isMobileMenuOpen;
      navMenu.classList.toggle("open", isMobileMenuOpen);
      hamburgerButton.classList.toggle("open", isMobileMenuOpen);
    });
  }

  const navLinks = navMenu.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (isMobileMenuOpen) {
        isMobileMenuOpen = false;
        navMenu.classList.remove("open");
        document.querySelector(".hamburger-menu")?.classList.remove("open");
      }
    });
  });
}

async function addNotificationButton() {
  console.log("Adding notification button");
  const notificationContainer = document.querySelector(".notification-item");

  if (!notificationContainer) {
    console.error("Notification container not found");
    return;
  }

  const existingButton = document.getElementById("notification-button");
  if (existingButton) {
    existingButton.remove();
  }

  const notificationButton = document.createElement("button");
  notificationButton.id = "notification-button";
  notificationButton.className = "notification-btn";
  notificationButton.textContent = "Memuat...";
  notificationButton.disabled = true;

  notificationContainer.appendChild(notificationButton);

  setTimeout(() => {
    if (
      notificationButton.disabled &&
      notificationButton.textContent === "Memuat..."
    ) {
      console.warn("Force reset button state after timeout");
      notificationState.isActive = false;
      notificationState.pendingOperation = false;
      updateButtonState();
    }
  }, 3000);

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

  async function handleNotificationButtonClick() {
    console.log(
      "Notification button clicked, current state:",
      notificationState.isActive
    );

    if (notificationState.pendingOperation) return;

    notificationState.pendingOperation = true;
    updateButtonState();

    let operationTimeout;
    const TIMEOUT_MS = 5000;

    operationTimeout = setTimeout(() => {
      console.warn("Operation timed out");
      notificationState.pendingOperation = false;
      updateButtonState();
      showToast("Operasi timeout. Silakan coba lagi.", "warning");
    }, TIMEOUT_MS);

    try {
      if (notificationState.isActive) {
        console.log("Trying to unsubscribe (browser-agnostic)...");

        const registrations = await navigator.serviceWorker.getRegistrations();
        let result = { error: true, message: "Tidak ada service worker aktif" };

        if (registrations.length > 0) {
          for (const registration of registrations) {
            try {
              const subscription =
                await registration.pushManager.getSubscription();
              if (subscription) {
                await subscription.unsubscribe();
                result = {
                  error: false,
                  message: "Berhasil berhenti berlangganan",
                };
                break;
              }
            } catch (err) {
              console.warn("Error on specific registration:", err);
            }
          }
        }

        notificationState.isActive = false;
        localStorage.setItem("notificationStatus", "false");

        if (result.error) {
          console.warn(`Unsubscribe warning: ${result.message}`);
          showToast("Notifikasi dinonaktifkan", "success");
        } else {
          showToast("Berhasil berhenti berlangganan notifikasi", "success");
        }
      } else {
        console.log("Trying to subscribe...");
        const result = await subscribePushNotification();

        if (result.error) {
          showToast(`Error: ${result.message}`, "error");
        } else {
          notificationState.isActive = true;
          localStorage.setItem("notificationStatus", "true");
          showToast("Notifikasi berhasil diaktifkan!", "success");
        }
      }
    } catch (error) {
      console.error("Error processing notification:", error);
      showToast("Terjadi kesalahan saat memproses notifikasi", "error");
      notificationState.isActive = false;
      localStorage.setItem("notificationStatus", "false");
    } finally {
      clearTimeout(operationTimeout);
      notificationState.pendingOperation = false;
      updateButtonState();
    }
  }

  notificationButton.addEventListener("click", handleNotificationButtonClick);

  const isBrave =
    (navigator.brave && (await navigator.brave.isBrave())) || false;
  if (isBrave) {
    console.log("Brave browser detected, using alternative checks");
  }

  checkNotificationSubscriptionStatus().then((isActive) => {
    notificationState.isActive = isActive;
    updateButtonState();
  });
}

async function checkNotificationSubscriptionStatus() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return false;
    }

    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve(null), 2000);
    });

    const registrations = await navigator.serviceWorker.getRegistrations();

    if (registrations.length === 0) {
      return false;
    }

    for (const registration of registrations) {
      try {
        const subscription = await Promise.race([
          registration.pushManager.getSubscription(),
          timeoutPromise,
        ]);

        if (subscription) return true;
      } catch (e) {
        console.warn("Error checking specific registration:", e);
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking push subscription:", error);
    return false;
  }
}

function showToast(message, type = "info") {
  const existingToasts = document.querySelectorAll(".toast-notification");
  existingToasts.forEach((toast) => {
    if (toast.classList.contains("show")) {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }
  });

  const toast = document.createElement("div");
  toast.className = `toast-notification ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

const style = document.createElement("style");
style.textContent = `
  .header {
    background-color: #2d3748;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    position: relative;
    z-index: 100;
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    position: relative;
  }
  
  .site-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0;
  }
  
  .nav {
    margin-left: auto;
  }
  
  .nav-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .nav-list li {
    margin: 0 10px;
  }
  
  .nav-link {
    color: white;
    text-decoration: none;
    font-size: 1rem;
    padding: 10px 5px;
    transition: color 0.3s;
    display: block;
  }
  
  .nav-link:hover {
    color: #38b2ac;
  }
  
  /* Hamburger Menu Styles */
  .hamburger-menu {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 30px;
    height: 21px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 200;
    margin-left: 15px;
  }
  
  .hamburger-menu span {
    width: 100%;
    height: 3px;
    background-color: white;
    border-radius: 3px;
    transition: all 0.3s ease;
  }
  
  .hamburger-menu.open span:nth-child(1) {
    transform: translateY(9px) rotate(45deg);
  }
  
  .hamburger-menu.open span:nth-child(2) {
    opacity: 0;
  }
  
  .hamburger-menu.open span:nth-child(3) {
    transform: translateY(-9px) rotate(-45deg);
  }
  
  /* Notification Button Styles */
  .notification-btn {
    padding: 8px 12px;
    background-color: #6b7280;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
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
  
  /* Toast Notification Styles */
  .toast-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 3px 6px rgba(0,0,0,0.2);
    z-index: 9999;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  .toast-notification.show {
    transform: translateY(0);
    opacity: 1;
  }
  
  .toast-notification.warning {
    background: #f59e0b;
  }
  
  .toast-notification.error {
    background: #ef4444;
  }
  
  .toast-notification.success {
    background: #10b981;
  }
  
  /* Media Query for Mobile */
  @media (max-width: 768px) {
    .hamburger-menu {
      display: flex;
      margin-top: 20px;
    }
    
    .nav {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #2d3748;
      padding: 0;
      z-index: 99;
    }
    
    .nav-list {
      flex-direction: column;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.5s ease;
      width: 100%;
    }
    
    .nav-list.open {
      max-height: 500px; /* Adjust based on your menu height */
    }
    
    .nav-list li {
      margin: 0;
      width: 100%;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    .nav-link {
      padding: 15px;
    }
    
    .notification-item {
      display: flex;
      justify-content: center;
      padding: 15px 0;
    }
    
    .notification-btn {
      padding: 10px 15px;
      width: 100%;
      max-width: 200px;
      margin: 0;
    }
    
    .site-title {
      font-size: 1.2rem; /* Smaller title on mobile */
    }
    
    .header-content {
      padding: 10px 0;
      flex-direction: row;
    }
  }
`;

document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing UI");
  updateAuthUI();
});

window.addEventListener("hashchange", () => {
  console.log("Hash changed, updating UI");
  updateAuthUI();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 768 && isMobileMenuOpen) {
    isMobileMenuOpen = false;
    const navMenu = document.getElementById("nav-menu");
    const hamburgerButton = document.querySelector(".hamburger-menu");
    if (navMenu) navMenu.classList.remove("open");
    if (hamburgerButton) hamburgerButton.classList.remove("open");
  }
});
