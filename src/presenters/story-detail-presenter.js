// filepath: /home/luminousv/Documents/DBS Dicoding/Study/Web-Intermediate/fairy-tale/src/presenters/story-detail-presenter.js
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
      // Try to get from network first
      const response = await this.#storyApi.getStoryDetail(this.#storyId);

      if (!response.error) {
        this.#currentStory = response.story;

        // Save to IndexedDB for offline access
        await FairyTaleDB.saveStory(response.story);

        // Check if this story is in favorites
        const isFavorite = await this.checkIsFavorite();
        this.#view.setFavoriteStatus(isFavorite);

        // Show the story
        this.#view.render(response.story);
      } else {
        // Try to get from IndexedDB
        const story = await FairyTaleDB.getStoryById(this.#storyId);

        if (story) {
          this.#currentStory = story;

          // Check if this story is in favorites
          const isFavorite = await this.checkIsFavorite();
          this.#view.setFavoriteStatus(isFavorite);

          // Show the story from IndexedDB
          this.#view.render(story);
        } else {
          this.#view.showErrorMessage("Story not found");
        }
      }
    } catch (error) {
      console.error("Error loading story:", error);

      // Try to get from IndexedDB as fallback
      try {
        const story = await FairyTaleDB.getStoryById(this.#storyId);

        if (story) {
          this.#currentStory = story;

          // Check if this story is in favorites
          const isFavorite = await this.checkIsFavorite();
          this.#view.setFavoriteStatus(isFavorite);

          // Show the story from IndexedDB
          this.#view.render(story);
        } else {
          this.#view.showErrorMessage("Failed to load story");
        }
      } catch (dbError) {
        this.#view.showErrorMessage("Failed to load story");
      }
    }
  }

  // Check if story is in favorites
  async checkIsFavorite() {
    try {
      const favorite = await FairyTaleDB.getFavoriteById(this.#storyId);
      return !!favorite;
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  }

  // Add current story to favorites
  async addToFavorites() {
    if (!this.#currentStory) {
      throw new Error("No story loaded");
    }

    return await FairyTaleDB.saveFavorite(this.#currentStory);
  }

  // Remove current story from favorites
  async removeFromFavorites() {
    if (!this.#storyId) {
      throw new Error("No story ID available");
    }

    return await FairyTaleDB.removeFavorite(this.#storyId);
  }
}

export default StoryDetailPresenter;
