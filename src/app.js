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

  _initialAppShell() {}

  async renderPage() {
    if (this.#isTransitioning) return;

    const activeRoute = getActiveRoute();
    const urlParams = parseActivePathname();
    this.#isTransitioning = true;

    try {
      let page;
      let oldElement = null;

      if (this.#currentPage && this.#mainContent.firstChild) {
        oldElement = this.#mainContent.firstChild;
        oldElement.classList.add("page-exit");

        void oldElement.offsetWidth;

        oldElement.classList.add("page-exit-active");

        await this.#waitForTransition(oldElement);
      }

      if (activeRoute === "/") {
        page = new HomePage();
        const homePresenter = new HomePresenter(page);
        page.setPresenter(homePresenter);

        const newElement = page.render();
        newElement.classList.add("page-enter");

        this.#mainContent.innerHTML = "";
        this.#mainContent.appendChild(newElement);

        void newElement.offsetWidth;

        newElement.classList.add("page-enter-active");

        await homePresenter.init();
      } else {
        const pageClass = routes[activeRoute];
        if (pageClass) {
          page = pageClass(urlParams);

          const newElement = page.render();
          newElement.classList.add("page-enter");

          this.#mainContent.innerHTML = "";
          this.#mainContent.appendChild(newElement);

          void newElement.offsetWidth;

          newElement.classList.add("page-enter-active");
        } else {
          this.#mainContent.innerHTML = "<p>Page not found</p>";
        }
      }

      this.#currentPage = page;

      if (this.#mainContent.firstChild) {
        await this.#waitForTransition(this.#mainContent.firstChild);
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
