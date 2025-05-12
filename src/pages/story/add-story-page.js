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

  async openCamera() {
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

    // Get the MediaStreamUtil instance from presenter
    const mediaStream = this.#presenter.getMediaStream();
    const cameraStarted = await mediaStream.startCamera(video);

    if (!cameraStarted) {
      document.body.removeChild(modal);
      this.showErrorMessage("Could not access camera");
      return;
    }

    captureButton.addEventListener("click", () => {
      const photoDataUrl = mediaStream.capturePhoto(canvas);
      if (photoDataUrl) {
        const imageBlob = mediaStream.dataURLtoBlob(photoDataUrl);
        this.#presenter.setImageBlob(imageBlob);
        this.showImagePreview(photoDataUrl);
        mediaStream.stopCamera();
        document.body.removeChild(modal);
      }
    });

    closeButton.addEventListener("click", () => {
      mediaStream.stopCamera();
      document.body.removeChild(modal);
    });
  }

  prepareCameraInterface() {
    // Create a modal for the camera interface
    const modal = document.createElement("div");
    modal.className = "camera-modal";
    modal.id = "camera-modal";
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

    // Return the video element that will be used by the MediaStreamUtil
    return document.getElementById("camera-preview");
  }

  showCameraInterface(videoStream, mediaStreamUtil) {
    const captureButton = document.getElementById("capture-photo");
    const closeButton = document.getElementById("close-camera");
    const canvas = document.getElementById("photo-canvas");

    // Setup the capture button
    captureButton.addEventListener("click", () => {
      // Capture photo
      const photoDataUrl = mediaStreamUtil.capturePhoto(canvas);
      if (photoDataUrl) {
        // Convert to blob and send to presenter
        const imageBlob = mediaStreamUtil.dataURLtoBlob(photoDataUrl);
        this.#presenter.setImageFromCamera(imageBlob);
        this.showImagePreview(photoDataUrl);

        // Clean up
        mediaStreamUtil.stopCamera();
        const modal = document.getElementById("camera-modal");
        if (modal) {
          document.body.removeChild(modal);
        }
      }
    });

    // Setup the close button
    closeButton.addEventListener("click", () => {
      mediaStreamUtil.stopCamera();
      const modal = document.getElementById("camera-modal");
      if (modal) {
        document.body.removeChild(modal);
      }
    });
  }
}

export default AddStoryPage;
