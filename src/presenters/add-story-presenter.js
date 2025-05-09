import StoryApi from "../utils/api.js";
import StoryMap from "../utils/map.js";
import MediaStreamUtil from "../utils/media-stream.js";

class AddStoryPresenter {
  #view;
  #map;
  #mediaStream;
  #imageBlob = null;
  #selectedLocation = null;
  #storyApi = StoryApi;

  constructor(view) {
    this.#view = view;
    this.#map = new StoryMap();
    this.#mediaStream = new MediaStreamUtil();
  }

  async init() {
    this.#view.render();
    this.#view.setupEventListeners();

    // Setup map setelah DOM dirender
    setTimeout(() => {
      this.#view.setupMapView();
    }, 100);
  }

  async initMap(containerId) {
    const mapInitialized = await this.#map.initMap(containerId);
    if (!mapInitialized) {
      this.#view.showErrorMessage("Failed to initialize map");
    }
  }

  async useMyLocation() {
    try {
      const location = await this.#map.getUserLocation();
      const address = await this.#map.getAddressFromCoordinates(
        location.lat,
        location.lng
      );
      this.#view.showLocationInfo(address, location);
    } catch (error) {
      this.#view.showErrorMessage(
        "Could not get your location: " + error.message
      );
    }
  }

  async openCamera() {
    // Create modal for camera
    const modal = document.createElement("div");
    modal.className = "camera-modal";
    modal.innerHTML = `
      <div class="camera-container">
        <video id="camera-preview" autoplay playsinline></video>
        <div class="camera-controls">
          <button id="capture-photo" class="btn btn-primary">Take Photo</button>
          <button id="close-camera" class="btn btn-secondary">Cancel</button>
        </div>
        <canvas id="photo-canvas" style="display:none;"></canvas>
      </div>
    `;
    document.body.appendChild(modal);

    const video = document.getElementById("camera-preview");
    const captureButton = document.getElementById("capture-photo");
    const closeButton = document.getElementById("close-camera");
    const canvas = document.getElementById("photo-canvas");

    // Start camera
    const cameraStarted = await this.#mediaStream.startCamera(video);

    if (!cameraStarted) {
      document.body.removeChild(modal);
      this.#view.showErrorMessage("Could not access camera");
      return;
    }

    // Set up capture button
    captureButton.addEventListener("click", () => {
      const photoDataUrl = this.#mediaStream.capturePhoto(canvas);
      if (photoDataUrl) {
        this.#imageBlob = this.#mediaStream.dataURLtoBlob(photoDataUrl);
        this.#view.showImagePreview(photoDataUrl);
        this.#mediaStream.stopCamera();
        document.body.removeChild(modal);
      }
    });

    // Set up close button
    closeButton.addEventListener("click", () => {
      this.#mediaStream.stopCamera();
      document.body.removeChild(modal);
    });
  }

  async handleFileInput(file) {
    if (!file) return;

    try {
      const imageUrl = await this.#mediaStream.fileToBase64(file);
      this.#imageBlob = file;
      this.#view.showImagePreview(imageUrl);
    } catch (error) {
      this.#view.showErrorMessage("Error processing image: " + error.message);
    }
  }

  // Update this method in your presenter
  async submitStory(description) {
    if (!description) {
      this.#view.showErrorMessage("Description is required");
      return;
    }

    if (!this.#imageBlob) {
      this.#view.showErrorMessage("Image is required");
      return;
    }

    this.#view.showLoadingIndicator(true);

    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", this.#imageBlob);

    // If location is selected, add lat and lon
    if (this.#selectedLocation) {
      formData.append("lat", this.#selectedLocation.lat);
      formData.append("lon", this.#selectedLocation.lng);
    }

    try {
      const response = await this.#storyApi.addNewStory(formData);

      if (response.error) {
        this.#view.showErrorMessage(response.message);
      } else {
        alert("Story shared successfully!");
        window.location.hash = "#/stories";
      }
    } catch (error) {
      this.#view.showErrorMessage(error.message || "Failed to share story");
    } finally {
      this.#view.showLoadingIndicator(false);
    }
  }
}

export default AddStoryPresenter;
