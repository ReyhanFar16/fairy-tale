import FairyTaleDB from "../data/database.js";

class FavoritesPresenter {
  #view;
  #favorites = [];

  constructor(view) {
    this.#view = view;
  }

  async init() {
    try {
      this.#favorites = await FairyTaleDB.getAllFavorites();

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
      await FairyTaleDB.removeFavorite(id);

      this.#favorites = this.#favorites.filter((story) => story.id !== id);

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
