import StoryApi from "../utils/api.js";

class StoryListPresenter {
  #view;
  #allStories = [];
  #filteredStories = [];

  constructor(view) {
    this.#view = view;
  }

  async init() {
    this.#view.showLoadingState();
    await this.loadStories();
    this.#view.setupEventListeners();
  }

  async loadStories() {
    try {
      const response = await StoryApi.getStories();
      console.log("Fetching stories...");
      console.log("API response:", response);

      if (response.error) {
        this.#view.showErrorMessage(response.message);
        return;
      }

      this.#allStories = response.stories;
      this.#filteredStories = [...this.#allStories];

      this.#view.render({ stories: this.#filteredStories });
    } catch (error) {
      console.error("Error loading stories:", error);
      this.#view.showErrorMessage(error.message || "Failed to load stories");
    }
  }

  filterStories(query) {
    if (!query) {
      this.#view.updateStoriesList(this.#allStories);
      return;
    }

    const queryLowerCase = query.toLowerCase();

    const filteredStories = this.#allStories.filter((story) => {
      const descriptionMatch =
        story.description &&
        story.description.toLowerCase().includes(queryLowerCase);

      const nameMatch =
        story.name && story.name.toLowerCase().includes(queryLowerCase);

      return descriptionMatch || nameMatch;
    });

    this.#view.updateStoriesList(filteredStories);
  }
}

export default StoryListPresenter;
