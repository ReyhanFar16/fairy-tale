class StoryDetailPage {
  #presenter;
  #container;

  constructor() {
    this.#container = document.createElement("div");
    this.#container.className = "story-detail-container";
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  render(story = null) {
    if (story) {
      this.#container.innerHTML = `
          <div class="story-detail">
            <div class="story-header">
              <h2 class="page-title">Story by ${story.name}</h2>
              <span class="story-date">${this.#formatDate(
                story.createdAt
              )}</span>
            </div>
            
            <div class="story-detail-image style="view-transition-name: story-${
              story.id
            }">
              <img src="${story.photoUrl}" alt="Story by ${story.name}" />
            </div>
            
            <div class="story-detail-content">
              <p class="story-description">${story.description}</p>
              
              <div class="story-author-info">
                <div class="author-avatar">
                  <img src="${
                    story.photoUrl || "/assets/avatar-placeholder.jpg"
                  }" alt="${story.name}" />
                </div>
                <div class="author-details">
                  <h4>${story.name}</h4>
                </div>
              </div>
              
              ${
                story.lat && story.lon
                  ? `
                <div class="story-location">
                  <h4>Location</h4>
                  <div id="story-map" style="height: 300px; margin-top: 15px;"></div>
                </div>
              `
                  : ""
              }
              
              <div class="story-actions">
                <a href="#/stories" class="btn btn-secondary">Back to Stories</a>
              </div>
            </div>
          </div>
        `;

      if (story.lat && story.lon) {
        setTimeout(() => {
          this.#initMap(story);
        }, 100);
      }
    } else {
      this.#container.innerHTML = `
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading story...</p>
          </div>
        `;
    }

    return this.#container;
  }

  #formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  #initMap(story) {
    const mapElement = document.getElementById("story-map");
    if (window.L && mapElement) {
      const map = L.map("story-map").setView([story.lat, story.lon], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker([story.lat, story.lon])
        .addTo(map)
        .bindPopup(`<b>Story by ${story.name}</b>`)
        .openPopup();
    }
  }

  showErrorMessage(message) {
    this.#container.innerHTML = `
      <div class="error-container">
        <h2>Oops! Something went wrong</h2>
        <p class="error-message">${message}</p>
        <div class="error-actions">
          <button id="go-back-btn" class="btn btn-secondary">Go Back</button>
          <button id="retry-btn" class="btn btn-primary">Try Again</button>
        </div>
      </div>
    `;

    const goBackButton = this.#container.querySelector("#go-back-btn");
    if (goBackButton) {
      goBackButton.addEventListener("click", () => {
        window.history.back();
      });
    }

    const retryButton = this.#container.querySelector("#retry-btn");
    if (retryButton) {
      retryButton.addEventListener("click", () => {
        this.showLoadingState();
        this.#presenter.loadStory();
      });
    }
  }

  showLoadingState() {
    this.#container.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading story...</p>
        </div>
      `;
  }
}

export default StoryDetailPage;
