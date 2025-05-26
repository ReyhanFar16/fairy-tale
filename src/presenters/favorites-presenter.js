import FairyTaleDB from "../data/database.js";

class FavoritesPresenter {
  #view;
  #favorites = [];

  constructor(view) {
    this.#view = view;
  }

  async init() {
    try {
      // Fetch favorites from IndexedDB
      this.#favorites = await FairyTaleDB.getAllFavorites();

      // Update the view
      this.#view.hideLoadingIndicator();
      this.#view.populateFavorites(this.#favorites);
    } catch (error) {
      console.error("Error loading favorites:", error);
      this.#view.hideLoadingIndicator();
      this.#view.showErrorMessage("Failed to load favorite stories");
    }
  }

  async removeFavorite(id) {
    try {
      // Remove from IndexedDB
      await FairyTaleDB.removeFavorite(id);

      // Update local data
      this.#favorites = this.#favorites.filter((story) => story.id !== id);

      // Update the view
      this.#view.hideLoadingIndicator();
      this.#view.populateFavorites(this.#favorites);

      return true;
    } catch (error) {
      console.error("Error removing favorite:", error);
      this.#view.hideLoadingIndicator();
      this.#view.showErrorMessage("Failed to remove from favorites");
      return false;
    }
  }
}

export default FavoritesPresenter;
