import StoryApi from "../utils/api.js";

class StoryMapPresenter {
  #view;
  #stories = [];

  constructor(view) {
    this.#view = view;
  }

  async init() {
    this.#view.showLoadingState();

    const success = await this.loadStoriesWithLocation();

    if (success) {
      this.#view.render();

      setTimeout(() => {
        const mapInitialized = this.#view.setupMap();
        if (mapInitialized) {
          console.log("Adding markers for", this.#stories.length, "stories");
          this.#view.addStoryMarkers(this.#stories);
        } else {
          this.#view.showErrorMessage("Failed to initialize map");
        }
      }, 100);
    }
  }

  async loadStoriesWithLocation() {
    try {
      console.log("Fetching stories from API...");
      const response = await StoryApi.getStories();
      console.log("API response:", response);

      if (response.error) {
        this.#view.showErrorMessage(response.message);
        return false;
      }

      this.#stories = response.stories.filter((story) => {
        const hasLocation = story.lat && story.lon;
        if (!hasLocation) {
          console.log("Story without location:", story.id);
        }
        return hasLocation;
      });

      console.log("Found", this.#stories.length, "stories with location");

      if (this.#stories.length === 0) {
        this.#view.showErrorMessage("No stories with location data found");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error loading stories with location:", error);
      this.#view.showErrorMessage(
        error.message || "Failed to load stories with location"
      );
      return false;
    }
  }
}

export default StoryMapPresenter;
