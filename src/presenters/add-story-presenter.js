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
    try {
      const videoElement = this.#view.prepareCameraInterface();

      const videoStream = await this.#mediaStream.startCamera(videoElement);
      if (!videoStream) {
        this.#view.showErrorMessage("Could not access camera");
        return;
      }

      this.#view.showCameraInterface(videoStream, this.#mediaStream);
    } catch (error) {
      this.#view.showErrorMessage("Error accessing camera: " + error.message);
    }
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

  setImageFromCamera(blob) {
    this.#imageBlob = blob;
  }
}

export default AddStoryPresenter;
