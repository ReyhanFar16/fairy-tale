import template from "../../template.js";

class AddStoryPage {
  #presenter;
  #container;

  constructor() {
    this.#container = document.createElement("div");
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  render() {
    this.#container.innerHTML = template.addStoryPage();
    return this.#container;
  }

  setupMapView() {
    const mapContainer = this.#container.querySelector("#map-container");
    if (mapContainer) {
      this.#presenter.initMap(mapContainer.id);
    }
  }

  setupEventListeners() {
    const cameraButton = this.#container.querySelector("#camera-button");
    if (cameraButton) {
      cameraButton.addEventListener("click", () => {
        this.#presenter.openCamera();
      });
    }

    const fileInput = this.#container.querySelector("#file-input");
    if (fileInput) {
      fileInput.addEventListener("change", (event) => {
        this.#presenter.handleFileInput(event.target.files[0]);
      });
    }

    const locationButton = this.#container.querySelector("#use-my-location");
    if (locationButton) {
      locationButton.addEventListener("click", () => {
        this.#presenter.useMyLocation();
      });
    }

    const form = this.#container.querySelector("#add-story-form");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const description =
          this.#container.querySelector("#story-description").value;

        this.#presenter.submitStory(description);
      });
    }
  }

  showImagePreview(imageUrl) {
    const imagePreview = this.#container.querySelector("#image-preview");
    const noImageText = this.#container.querySelector("#no-image-text");

    if (imagePreview && noImageText) {
      imagePreview.src = imageUrl;
      imagePreview.style.display = "block";
      noImageText.style.display = "none";
    }
  }

  showLocationInfo(locationName, coordinates) {
    const selectedLocationElement =
      this.#container.querySelector("#selected-location");
    const coordinatesElement = this.#container.querySelector("#coordinates");

    if (selectedLocationElement) {
      selectedLocationElement.textContent = locationName;
    }

    if (coordinatesElement) {
      coordinatesElement.textContent = `${coordinates.lat.toFixed(
        6
      )}, ${coordinates.lng.toFixed(6)}`;
    }
  }

  showLoadingIndicator(isLoading) {
    const submitButton = this.#container.querySelector("#submit-story");

    if (submitButton) {
      if (isLoading) {
        submitButton.textContent = "Submitting...";
        submitButton.disabled = true;
      } else {
        submitButton.textContent = "Share Story";
        submitButton.disabled = false;
      }
    }
  }

  showErrorMessage(message) {
    alert(`Error: ${message}`);
  }
}

export default AddStoryPage;
