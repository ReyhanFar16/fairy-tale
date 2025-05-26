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
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register(new URL("sw.bundle.js", window.location.origin).pathname)
        .then((registration) => {
          console.log("SW registered:", registration);
        })
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    });
  }

  return null;
}

window.addEventListener("load", () => {
  registerServiceWorker();
});
