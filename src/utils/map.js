class StoryMap {
  #map = null;
  #marker = null;
  #selectedLocation = null;

  async initMap(mapContainerId, lat = -6.2088, lng = 106.8456) {
    try {
      if (!window.L) {
        console.error("Leaflet library not loaded!");
        return false;
      }

      this.#map = L.map(mapContainerId).setView([lat, lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.#map);

      this.#map.on("click", (e) => {
        this.setMarker(e.latlng.lat, e.latlng.lng);
      });

      return true;
    } catch (error) {
      console.error("Error initializing map:", error);
      return false;
    }
  }

  setMarker(lat, lng) {
    if (this.#marker) {
      this.#map.removeLayer(this.#marker);
    }

    this.#marker = L.marker([lat, lng]).addTo(this.#map);

    this.#selectedLocation = { lat, lng };

    return this.#selectedLocation;
  }

  getSelectedLocation() {
    return this.#selectedLocation;
  }

  async getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            if (this.#map) {
              this.#map.setView([location.lat, location.lng], 15);
              this.setMarker(location.lat, location.lng);
            }

            resolve(location);
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  }

  async getAddressFromCoordinates(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || "Unknown Location";
    } catch (error) {
      console.error("Error getting address:", error);
      return "Unknown Location";
    }
  }
}

export default StoryMap;
