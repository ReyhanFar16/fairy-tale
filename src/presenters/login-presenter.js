import AuthService from "../utils/auth.js";

class LoginPresenter {
  #view;

  constructor(view) {
    this.#view = view;
  }

  async init() {
    this.#view.render();
    this.#view.setupEventListeners();

    if (AuthService.isLoggedIn()) {
      window.location.hash = "#/";
    }
  }

  async login(email, password) {
    if (!email || !password) {
      this.#view.showErrorMessage("Please fill in all fields");
      return;
    }

    this.#view.showLoadingIndicator(true);

    try {
      console.log("Attempting login with:", email);
      const response = await AuthService.login(email, password);
      console.log("Login response:", response);

      if (response.error) {
        this.#view.showErrorMessage(response.message);
      } else {
        console.log("Login successful, token:", AuthService.getToken());
        window.location.hash = "#/";
      }
    } catch (error) {
      console.error("Login error:", error);
      this.#view.showErrorMessage(error.message || "Login failed");
    } finally {
      this.#view.showLoadingIndicator(false);
    }
  }
}

export default LoginPresenter;
