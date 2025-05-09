class LoginPage {
  #presenter;
  #container;

  constructor() {
    this.#container = document.createElement("div");
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  render() {
    this.#container.innerHTML = `
        <div class="auth-container">
          <h2 class="page-title">Login to Fairy Tale</h2>
          <form id="login-form" class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required placeholder="Enter your email">
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required placeholder="Enter your password">
            </div>
            <div class="form-actions">
              <button type="submit" id="login-button" class="btn btn-primary">Login</button>
            </div>
            <p class="auth-message">Don't have an account? <a href="#/register">Register here</a></p>
          </form>
        </div>
      `;
    return this.#container;
  }

  setupEventListeners() {
    const form = this.#container.querySelector("#login-form");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = this.#container.querySelector("#email").value;
        const password = this.#container.querySelector("#password").value;

        this.#presenter.login(email, password);
      });
    }
  }

  showLoadingIndicator(isLoading) {
    const button = this.#container.querySelector("#login-button");

    if (button) {
      if (isLoading) {
        button.textContent = "Logging in...";
        button.disabled = true;
      } else {
        button.textContent = "Login";
        button.disabled = false;
      }
    }
  }

  showErrorMessage(message) {
    alert(`Error: ${message}`);
  }
}

export default LoginPage;
