// This is entry point

// -- CSS imports --
import css from "./assets/styles/style.css";
import "./assets/styles/responsive.css";
import "./assets/styles/animation.css";
import "./assets/styles/story-detail.css";
import "./assets/styles/favorites.css";

// -- JS imports --
import app from "./app.js";
import "./utils/global-exports.js";
import "./nav.js";

// Register service worker
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/sw.bundle.js"
      );
      console.log("Service worker registered successfully:", registration);
      return registration;
    } catch (error) {
      console.error("Failed to install service worker:", error);
      return null;
    }
  }
  return null;
}

// Initialize when DOM is ready
window.addEventListener("DOMContentLoaded", async () => {
  await registerServiceWorker();
  // Removed initializeSubscriptionButton() - now handled by nav.js
});
