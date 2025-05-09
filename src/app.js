import { getActiveRoute, parseActivePathname } from "./routes/url-parser.js";
import routes from "./routes/routes.js";
import HomePage from "./pages/home/home-page.js";
import HomePresenter from "./presenters/home-presenter.js";

class App {
  #mainContent = document.querySelector("#main-content");

  constructor() {
    this._initialAppShell();
  }

  _initialAppShell() {}

  async renderPage() {
    const activeRoute = getActiveRoute();
    const urlParams = parseActivePathname();

    try {
      let page;

      if (activeRoute === "/") {
        page = new HomePage();
        const homePresenter = new HomePresenter(page);
        page.setPresenter(homePresenter);

        this.#mainContent.innerHTML = "";
        this.#mainContent.appendChild(page.render());

        await homePresenter.init();
      } else {
        const pageClass = routes[activeRoute];
        if (pageClass) {
          page = pageClass();
          this.#mainContent.innerHTML = "";
          this.#mainContent.appendChild(page.render());
        } else {
          this.#mainContent.innerHTML = "<p>Page not found</p>";
        }
      }
    } catch (error) {
      console.error("Error rendering page:", error);
      this.#mainContent.innerHTML = "<p>Error loading page</p>";
    }
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
