import FairyTaleDB from "../../data/database.js";

export default class FavoritesPage {
  #presenter;
  #container;

  constructor() {
    this.#presenter = null;
    this.#container = document.createElement("div");
    this.#container.className = "favorites-page";
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  render() {
    this.#container.innerHTML = `
      <section class="favorites-section">
        <div class="container">
          <header class="section-header">
            <h1 class="section-title">My Favorite Stories</h1>
            <p class="section-description">Stories you've saved for later reading</p>
          </header>
          
          <div class="favorites-container">
            <div id="favorites-list" class="stories-grid">
              <div class="loading-container">
                <div class="spinner"></div>
                <p>Loading your favorite stories...</p>
              </div>
            </div>
            <div id="favorites-loading-container"></div>
          </div>
        </div>
      </section>
    `;

    return this.#container;
  }

  async populateFavorites(favorites) {
    if (!favorites || favorites.length <= 0) {
      this.populateFavoritesEmpty();
      return;
    }

    const html = favorites.reduce((accumulator, story) => {
      return (
        accumulator +
        `
        <div class="story-card" data-id="${story.id}">
          <div class="story-card__image">
            <img src="${story.photoUrl || "/images/placeholder.jpg"}" 
                 alt="${story.name || "Story image"}" 
                 class="story-thumbnail"
                 loading="lazy">
            <div class="story-card__favorite-badge">
              <i class="fas fa-heart"></i>
            </div>
          </div>
          <div class="story-card__content">
            <h3 class="story-card__title">${story.name || "Untitled Story"}</h3>
            <p class="story-card__description">${
              story.description?.length > 100
                ? story.description.substring(0, 100) + "..."
                : story.description || "No description"
            }</p>
            <div class="story-card__meta">
              <span class="story-card__date">
                <i class="far fa-clock"></i> ${new Date(
                  story.savedAt || Date.now()
                ).toLocaleDateString()}
              </span>
            </div>
            <div class="story-card__actions">
              <a href="#/stories/${story.id}" class="btn btn-primary btn-sm">
                <i class="far fa-eye"></i> View Story
              </a>
              <button class="btn btn-danger btn-sm remove-favorite" data-id="${
                story.id
              }">
                <i class="far fa-trash-alt"></i> Remove
              </button>
            </div>
          </div>
        </div>
      `
      );
    }, "");

    const favoritesList = this.#container.querySelector("#favorites-list");
    if (favoritesList) {
      favoritesList.innerHTML = `
        <div class="favorites-grid">${html}</div>
      `;
    }

    this.setupEventListeners();
  }

  populateFavoritesEmpty() {
    const favoritesList = this.#container.querySelector("#favorites-list");
    if (favoritesList) {
      favoritesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">
            <i class="far fa-heart"></i>
          </div>
          <h2 class="empty-state__title">No Favorite Stories Yet</h2>
          <p class="empty-state__description">
            When you mark stories as favorites, they'll appear here for easy access.
          </p>
          <a href="#/stories" class="btn btn-primary">
            <i class="fas fa-book-open"></i> Browse Stories
          </a>
        </div>
      `;
    }
  }

  showErrorMessage(message) {
    const favoritesList = this.#container.querySelector("#favorites-list");
    if (favoritesList) {
      favoritesList.innerHTML = `
        <div class="error-state">
          <div class="error-state__icon">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <h2 class="error-state__title">Error Loading Favorites</h2>
          <p class="error-state__description">${message}</p>
          <button id="retry-button" class="btn btn-primary">
            <i class="fas fa-sync-alt"></i> Try Again
          </button>
        </div>
      `;

      const retryButton = favoritesList.querySelector("#retry-button");
      if (retryButton) {
        retryButton.addEventListener("click", () => {
          this.showLoadingIndicator();
          if (this.#presenter) {
            this.#presenter.init();
          }
        });
      }
    }
  }

  showLoadingIndicator() {
    const loadingContainer = this.#container.querySelector(
      "#favorites-loading-container"
    );
    if (loadingContainer) {
      loadingContainer.innerHTML = `
        <div class="overlay-loader">
          <div class="spinner-container">
            <div class="spinner"></div>
          </div>
        </div>
      `;
    }
  }

  hideLoadingIndicator() {
    const loadingContainer = this.#container.querySelector(
      "#favorites-loading-container"
    );
    if (loadingContainer) {
      loadingContainer.innerHTML = "";
    }
  }

  setupEventListeners() {
    const removeButtons = this.#container.querySelectorAll(".remove-favorite");

    removeButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.stopPropagation();
        const storyId = event.target.closest(".remove-favorite").dataset.id;

        if (storyId && this.#presenter) {
          const confirmed = confirm(
            "Are you sure you want to remove this story from favorites?"
          );
          if (confirmed) {
            this.showLoadingIndicator();
            await this.#presenter.removeFavorite(storyId);
          }
        }
      });
    });

    const storyCards = this.#container.querySelectorAll(".story-card");
    storyCards.forEach((card) => {
      card.addEventListener("click", (event) => {
        if (!event.target.closest(".remove-favorite")) {
          const storyId = card.dataset.id;
          window.location.hash = `#/stories/${storyId}`;
        }
      });
    });
  }
}
