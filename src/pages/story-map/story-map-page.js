import StoryMap from "../../utils/map";

class StoryMapPage {
  #container;
  #map;
  #presenter;

  constructor() {
    this.#container = document.createElement("div");
    this.#container.className = "story-map-container";
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  render() {
    this.#container.innerHTML = `
          <div class="map-container">
            <h2 class="page-title">Story Map</h2>
            <div id="stories-map" style="height: 500px; width: 100%;"></div>
          </div>
        `;
    return this.#container;
  }

  setupMap() {
    const mapElement = this.#container.querySelector("#stories-map");
    if (window.L && mapElement) {
      this.#map = L.map(mapElement).setView([-6.2088, 106.8456], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.#map);

      return true;
    }
    return false;
  }

  addStoryMarkers(stories) {
    if (!this.#map) return;

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.#map);

        // Create popup with story information
        const popupContent = `
              <div class="map-popup">
                <h3>${story.name}'s Story</h3>
                <img src="${
                  story.photoUrl
                }" alt="Story image" style="width:100%; max-height:150px; object-fit:cover;">
                <p>${this.#truncateText(story.description, 100)}</p>
                <a href="#/stories/${
                  story.id
                }" class="btn btn-primary" style="color:white;">Read More</a>
              </div>
            `;

        marker.bindPopup(popupContent);
      }
    });
  }

  #truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  }

  showLoadingState() {
    this.#container.innerHTML = `
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading map...</p>
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
        this.#presenter.loadStoriesWithLocation();
      });
    }
  }
}

export default StoryMapPage;
