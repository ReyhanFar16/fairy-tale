export default class HomePresenter {
  #view;
  #data;

  constructor(view) {
    this.#view = view;
    this.#data = {
      title: "Welcome to the Home Page",
      description: "This is the home page of Fairy Tale Applications.",
    };
  }

  async init() {
    await this.#loadData();
    this.#view.render(this.#data);
    this.#view.setupEventListeners(this);
  }

  async #loadData() {
    try {
      console.log("Loading data...");
      // Simulasi loading data (bisa diganti dengan fetch API nanti)
      await new Promise((resolve) => setTimeout(resolve, 100));
      console.log("Data loaded successfully");
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  getHomeData() {
    return this.#data;
  }

  // Implement method yang digunakan di home-page.js
  handleButtonClick() {
    console.log("Home action button clicked");
    alert("You clicked the Learn More button!");
    // Implementasi fungsi lainnya sesuai kebutuhan
  }
}
