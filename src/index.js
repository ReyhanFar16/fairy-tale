// This is entry point

// -- CSS --
import css from "./assets/styles/style.css";
import "./assets/styles/responsive.css";
import "./assets/styles/animation.css";
import "./assets/styles/story-detail.css";

// -- JS --
import app from "./app.js";
import "./utils/global-exports.js";
import "./nav.js";

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log(
        "Service Worker berhasil didaftarkan dengan scope:",
        registration.scope
      );
      return registration;
    } catch (error) {
      console.error("Gagal mendaftarkan Service Worker:", error);
      return null;
    }
  }
  return null;
}

window.addEventListener("load", () => {
  registerServiceWorker();
});
