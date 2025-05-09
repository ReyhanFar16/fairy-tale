import AuthService from "../utils/auth.js";

class RegisterPresenter {
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

  async register(name, email, password) {
    if (!name || !email || !password) {
      this.#view.showErrorMessage("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      this.#view.showErrorMessage("Password must be at least 6 characters");
      return;
    }

    this.#view.showLoadingIndicator(true);

    try {
      console.log("Attempting registration with:", email);
      const response = await AuthService.register(name, email, password);
      console.log("Registration response:", response);

      if (response.error) {
        this.#view.showErrorMessage(response.message);
      } else {
        alert("Registration successful! Please login with your new account.");
        window.location.hash = "#/login";
      }
    } catch (error) {
      console.error("Registration error:", error);
      this.#view.showErrorMessage(error.message || "Registration failed");
    } finally {
      this.#view.showLoadingIndicator(false);
    }
  }
}

export default RegisterPresenter;
