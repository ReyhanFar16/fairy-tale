class RegisterPage {
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
          <h2 class="page-title">Create an Account</h2>
          <form id="register-form" class="auth-form">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input type="text" id="name" name="name" required placeholder="Enter your name">
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required placeholder="Enter your email">
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required minlength="6" placeholder="Min. 6 characters">
            </div>
            <div class="form-actions">
              <button type="submit" id="register-button" class="btn btn-primary">Register</button>
            </div>
            <p class="auth-message">Already have an account? <a href="#/login">Login here</a></p>
          </form>
        </div>
      `;
    return this.#container;
  }

  setupEventListeners() {
    const form = this.#container.querySelector("#register-form");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = this.#container.querySelector("#name").value;
        const email = this.#container.querySelector("#email").value;
        const password = this.#container.querySelector("#password").value;

        this.#presenter.register(name, email, password);
      });
    }
  }

  showLoadingIndicator(isLoading) {
    const button = this.#container.querySelector("#register-button");

    if (button) {
      if (isLoading) {
        button.textContent = "Registering...";
        button.disabled = true;
      } else {
        button.textContent = "Register";
        button.disabled = false;
      }
    }
  }

  showErrorMessage(message) {
    alert(`Error: ${message}`);
  }
}

export default RegisterPage;
