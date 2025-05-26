import FairyTaleDB from "../data/database.js";
import StoryApi from "../utils/api.js";

class StoryDetailPresenter {
  #view;
  #storyApi;
  #storyId;
  #currentStory = null;

  constructor(view, storyId) {
    this.#view = view;
    this.#storyApi = StoryApi;
    this.#storyId = storyId;
  }

  async init() {
    this.#view.showLoadingState();
    await this.loadStory();
  }

  async loadStory() {
    try {
      const response = await this.#storyApi.getStoryDetail(this.#storyId);

      if (!response.error) {
        this.#currentStory = response.story;

        await FairyTaleDB.saveStory(response.story);

        const isFavorite = await this.checkIsFavorite();
        this.#view.setFavoriteStatus(isFavorite);

        this.#view.render(response.story);
      } else {
        const story = await FairyTaleDB.getStoryById(this.#storyId);

        if (story) {
          this.#currentStory = story;

          const isFavorite = await this.checkIsFavorite();
          this.#view.setFavoriteStatus(isFavorite);

          this.#view.render(story);
        } else {
          this.#view.showErrorMessage("Story not found");
        }
      }
    } catch (error) {
      console.error("Error loading story:", error);

      try {
        const story = await FairyTaleDB.getStoryById(this.#storyId);

        if (story) {
          this.#currentStory = story;

          const isFavorite = await this.checkIsFavorite();
          this.#view.setFavoriteStatus(isFavorite);

          this.#view.render(story);
        } else {
          this.#view.showErrorMessage("Failed to load story");
        }
      } catch (dbError) {
        this.#view.showErrorMessage("Failed to load story");
      }
    }
  }

  async checkIsFavorite() {
    try {
      const favorite = await FairyTaleDB.getFavoriteById(this.#storyId);
      return !!favorite;
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  }

  async addToFavorites() {
    if (!this.#currentStory) {
      throw new Error("No story loaded");
    }

    return await FairyTaleDB.saveFavorite(this.#currentStory);
  }

  async removeFromFavorites() {
    if (!this.#storyId) {
      throw new Error("No story ID available");
    }

    return await FairyTaleDB.removeFavorite(this.#storyId);
  }
}

export default StoryDetailPresenter;
