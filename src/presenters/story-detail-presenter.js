import StoryApi from "../utils/api.js";

class StoryDetailPresenter {
  #view;
  #id;
  #story = null;

  constructor(view, id) {
    this.#view = view;
    this.#id = id;
  }

  async init() {
    this.#view.showLoadingState();
    await this.loadStory();
  }

  async loadStory() {
    try {
      const response = await StoryApi.getStoryDetail(this.#id);

      if (response.error) {
        this.#view.showErrorMessage(response.message);
        return;
      }

      this.#story = response.story;
      this.#view.render(this.#story);
    } catch (error) {
      console.error("Error loading story:", error);
      this.#view.showErrorMessage(error.message || "Failed to load story");
    }
  }
}

export default StoryDetailPresenter;
