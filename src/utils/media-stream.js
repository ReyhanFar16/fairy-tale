class MediaStreamUtil {
  #stream = null;
  #videoElement = null;

  async startCamera(videoElement) {
    try {
      this.#videoElement = videoElement;

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        },
        audio: false,
      };

      this.#stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.#videoElement.srcObject = this.#stream;

      return true;
    } catch (error) {
      console.error("Error accessing camera:", error);
      return false;
    }
  }

  stopCamera() {
    if (this.#stream) {
      this.#stream.getTracks().forEach((track) => track.stop());
      this.#stream = null;

      if (this.#videoElement) {
        this.#videoElement.srcObject = null;
      }
    }
  }

  capturePhoto(canvasElement) {
    if (!this.#stream || !this.#videoElement || !canvasElement) return null;

    const context = canvasElement.getContext("2d");
    canvasElement.width = this.#videoElement.videoWidth;
    canvasElement.height = this.#videoElement.videoHeight;

    context.drawImage(
      this.#videoElement,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    return canvasElement.toDataURL("image/jpeg");
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  dataURLtoBlob(dataURL) {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }
}

export default MediaStreamUtil;
