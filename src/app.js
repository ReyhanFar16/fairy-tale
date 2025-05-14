import { getActiveRoute, parseActivePathname } from "./routes/url-parser.js";
import routes from "./routes/routes.js";
import HomePage from "./pages/home/home-page.js";
import HomePresenter from "./presenters/home-presenter.js";

class App {
  #mainContent = document.querySelector("#main-content");
  #currentPage = null;
  #isTransitioning = false;

  constructor() {
    this._initialAppShell();
  }

  _initialAppShell() {
    this.#mainContent.setAttribute("tabindex", "-1");

    const skipLink = document.querySelector(".skip-link");
    if (skipLink) {
      skipLink.addEventListener("click", (event) => {
        event.preventDefault();
        skipLink.blur();
        this.#mainContent.focus();
        this.#mainContent.scrollIntoView({ behavior: "smooth" }); // Scroll to main content
      });
    }
  }

  async renderPage() {
    if (this.#isTransitioning) return;

    const activeRoute = getActiveRoute();
    const urlParams = parseActivePathname();
    this.#isTransitioning = true;

    try {
      if (document.startViewTransition) {
        // First, prepare ALL content and do ALL async operations
        let page;
        let contentNode;

        if (activeRoute === "/") {
          page = new HomePage();
          const homePresenter = new HomePresenter(page);
          page.setPresenter(homePresenter);

          contentNode = page.render();

          // Do async operations BEFORE starting the transition
          await homePresenter.init();
        } else {
          const pageClass = routes[activeRoute];
          if (pageClass) {
            page = pageClass(urlParams);
            contentNode = page.render();

            // If the page needs initialization, do it here
            if (page.getPresenter && page.getPresenter().init) {
              await page.getPresenter().init();
            }
          } else {
            const notFoundElement = document.createElement("div");
            notFoundElement.innerHTML = "<p>Page not found</p>";
            contentNode = notFoundElement;
          }
        }

        // Now that all async work is done, start the transition
        // with ONLY synchronous DOM operations inside the callback
        const transition = document.startViewTransition(() => {
          // Only synchronous DOM updates in this callback
          this.#mainContent.innerHTML = "";
          this.#mainContent.appendChild(contentNode);
          this.#currentPage = page;
        });

        // Wait for transition to complete
        await transition.finished;
        console.log("View transition completed");
      } else {
        // Your existing fallback code is fine
      }
    } catch (error) {
      console.error("Error rendering page:", error);
      this.#mainContent.innerHTML = "<p>Error loading page</p>";
    } finally {
      this.#isTransitioning = false;
    }
  }

  #waitForTransition(element) {
    return new Promise((resolve) => {
      function handleTransitionEnd() {
        element.removeEventListener("transitionend", handleTransitionEnd);
        resolve();
      }

      element.addEventListener("transitionend", handleTransitionEnd);
    });
  }
}

const app = new App();

window.addEventListener("hashchange", () => {
  app.renderPage();
});

window.addEventListener("DOMContentLoaded", () => {
  app.renderPage();
});

export default app;
