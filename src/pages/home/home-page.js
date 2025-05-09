export default class HomePage {
  #presenter;
  #container;

  constructor() {
    this.#container = document.createElement("div");
    this.#container.className = "home-page-container";
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  render(data = {}) {
    const { title, description } = data;

    // Inline modern styles
    this.#container.innerHTML = `
        <style>
          .home-page-container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
            background: linear-gradient(135deg, #f0f4ff 0%, #f5f7fa 100%);
            min-height: 100vh;
          }
          .hero-card {
            background: #ffffff;
            padding: 2.5rem;
            border-radius: 1rem;
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.08);
            max-width: 650px;
            text-align: center;
            transition: transform 0.3s ease;
          }
          .hero-card:hover {
            transform: translateY(-5px);
          }
          .hero-title {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: #222;
            font-weight: 600;
          }
          .hero-description {
            font-size: 1.125rem;
            margin-bottom: 2rem;
            color: #444;
            line-height: 1.6;
          }
          .btn-primary {
            padding: 0.75rem 1.75rem;
            font-size: 1rem;
            background-color: #4f46e5;
            color: white;
            border: none;
            border-radius: 0.75rem;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          .btn-primary:hover {
            background-color: #4338ca;
          }
        </style>
  
        <section class="hero-card">
          <h1 class="hero-title">${
            title || "Capture & Map Your Adventures"
          }</h1>
          <p class="hero-description">${
            description ||
            "Explore the world through your lens. Create stories with photos taken via camera, add location data on the map, and share your adventures with ease."
          }</p>
          <button id="home-action-button" class="btn-primary">
            ${title ? "Learn More" : "Get Started"}
          </button>
        </section>
      `;

    return this.#container;
  }

  setupEventListeners() {
    const actionButton = this.#container.querySelector("#home-action-button");
    if (actionButton) {
      actionButton.addEventListener("click", () => {
        this.#presenter.handleButtonClick();
      });
    }
  }
}
