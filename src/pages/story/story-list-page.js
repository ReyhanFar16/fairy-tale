class StoryListPage {
  #presenter;
  #container;

  constructor() {
    this.#container = document.createElement("div");
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  render(data = { stories: [] }) {
    this.#container.innerHTML = `
        <div class="stories-container">
          <h2 class="page-title">Story Collection</h2>
          <div class="stories-filter">
            <input type="text" id="story-search" placeholder="Search stories..." class="search-input">
          </div>
          <div class="stories-grid" id="stories-list">
            ${this.#generateStoriesList(data.stories)}
          </div>
          ${
            data.stories.length === 0
              ? '<p class="no-stories">No stories found. Be the first to share one!</p>'
              : ""
          }
        </div>
      `;
    return this.#container;
  }

  #generateStoriesList(stories) {
    if (stories.length === 0) {
      return "";
    }

    return stories
      .map(
        (story) => `
      <div class="story-card">
        <div class="story-image">
          <img src="${story.photoUrl}" alt="${story.name}'s story">
        </div>
        <div class="story-content">
          <h3 class="story-title">${story.name}</h3>
          <p class="story-date">${this.#formatDate(story.createdAt)}</p>
          <p class="story-description">${this.#truncateText(
            story.description,
            100
          )}</p>
          <button class="btn btn-primary read-more" data-story-id="${
            story.id
          }">Read more</button>
        </div>
      </div>
    `
      )
      .join("");
  }

  setupEventListeners() {
    const storiesList = this.#container.querySelector("#stories-list");
    if (storiesList) {
      storiesList.addEventListener("click", (event) => {
        if (event.target.classList.contains("read-more")) {
          const storyId = event.target.dataset.storyId;
          if (storyId) {
            window.location.hash = `#/stories/${storyId}`;
          }
        }
      });
    }

    const searchInput = this.#container.querySelector("#story-search");
    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        this.#presenter.filterStories(event.target.value);
      });
    }
  }

  #truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  }

  #formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  updateStoriesList(stories) {
    const storiesContainer = this.#container.querySelector("#stories-list");
    if (storiesContainer) {
      storiesContainer.innerHTML = this.#generateStoriesList(stories);
    }
  }

  showLoadingState() {
    this.#container.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading stories...</p>
        </div>
      `;
  }

  showErrorMessage(message) {
    this.#container.innerHTML = `
        <div class="error-container">
          <p class="error-message">Error: ${message}</p>
          <button id="retry-button" class="btn btn-primary">Retry</button>
        </div>
      `;

    const retryButton = this.#container.querySelector("#retry-button");
    if (retryButton) {
      retryButton.addEventListener("click", () => {
        this.showLoadingState();
        this.#presenter.loadStories();
      });
    }
  }
}

export default StoryListPage;
