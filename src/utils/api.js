import AuthService from "./auth.js";

class StoryApi {
  static BASE_URL = "https://story-api.dicoding.dev/v1";
  static GUEST_API_URL = `${this.BASE_URL}/stories/guest`;
  static AUTH_API_URL = `${this.BASE_URL}/stories`;
  static SUBSCRIBE = `${this.BASE_URL}/notifications/subscribe`;
  static UNSUBSCRIBE = `${this.BASE_URL}/notifications/unsubscribe`;

  static async fetchWithErrorHandling(url, options = {}) {
    try {
      console.log(`Making fetch request to: ${url}`);

      if (AuthService.isLoggedIn() && !url.includes("/guest")) {
        if (!options.headers) {
          options.headers = {};
        }
        options.headers.Authorization = `Bearer ${AuthService.getToken()}`;
      }

      const response = await fetch(url, options);

      console.log(`Response status: ${response.status}`);

      if (response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        console.log("Response data:", data);

        if (!response.ok) {
          throw new Error(
            data.message || `HTTP error! status: ${response.status}`
          );
        }

        return { response, data };
      } else {
        const text = await response.text();
        console.log("Response text:", text);

        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status}, body: ${text}`
          );
        }

        return { response, text };
      }
    } catch (error) {
      console.error(`Fetch error: ${error.message}`);

      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        console.error("Network error occurred. Possible causes:");
        console.error("- Server is down or unreachable");
        console.error("- CORS policy blocking the request");
        console.error("- Network connectivity issues");
        console.error("- Invalid URL format");
      }

      throw error;
    }
  }

  static async getStories() {
    try {
      const url = AuthService.isLoggedIn()
        ? this.AUTH_API_URL
        : this.GUEST_API_URL;

      const { data } = await this.fetchWithErrorHandling(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return {
        error: false,
        stories: data.listStory || [],
      };
    } catch (error) {
      console.error(`Error fetching stories:`, error);
      return {
        error: true,
        message: error.message || "Failed to fetch stories",
        stories: [],
      };
    }
  }

  /**
   * Retrieves story details by ID
   * @param {string} id - ID story
   */
  static async getStoryDetail(id) {
    try {
      if (!AuthService.isLoggedIn()) {
        console.warn(
          "User not logged in, story details require authentication"
        );
        return {
          error: true,
          message: "Authentication required to view story details",
          story: null,
        };
      }

      const url = `${this.AUTH_API_URL}/${id}`;
      console.log(
        `Getting story detail for ID ${id}, logged in: ${AuthService.isLoggedIn()}`
      );

      const { data } = await this.fetchWithErrorHandling(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!data || !data.story) {
        console.error("API returned success but no story data:", data);
        return {
          error: true,
          message: "Story data not found",
          story: null,
        };
      }

      return {
        error: false,
        story: data.story,
      };
    } catch (error) {
      console.error(`Error fetching story detail:`, error);
      return {
        error: true,
        message: error.message || "Failed to fetch story detail",
        story: null,
      };
    }
  }

  /**
   * Adds a new story
   * @param {FormData} formData - form data for the new story
   */
  /**
   * Adds a new story
   * @param {FormData} formData - form data for the new story
   */
  static async addNewStory(formData) {
    try {
      if (!formData.get("description")) {
        throw new Error("Description is required");
      }

      if (!formData.get("photo")) {
        throw new Error("Photo is required");
      }

      const lat = formData.get("lat");
      const lon = formData.get("lon");

      console.log("Location data in request:", { lat, lon });

      if (lat !== null && lon !== null) {
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);

        if (isNaN(latNum) || isNaN(lonNum)) {
          console.warn("Invalid location coordinates:", { lat, lon });
        } else {
          console.log("Valid coordinates detected:", {
            lat: latNum,
            lon: lonNum,
          });
        }
      } else {
        console.log("No location data provided for this story");
      }

      const url = AuthService.isLoggedIn()
        ? this.AUTH_API_URL
        : this.GUEST_API_URL;
      const { data } = await this.fetchWithErrorHandling(url, {
        method: "POST",
        body: formData,
      });

      return {
        error: false,
        ...data,
      };
    } catch (error) {
      console.error("Error submitting story:", error);
      return {
        error: true,
        message: error.message || "Failed to submit story",
      };
    }
  }

  /**
   * Mendaftarkan subscription push notification ke server
   * @param {Object} subscription - Data subscription
   */
  static async subscribePushNotification({ endpoint, keys }) {
    try {
      if (!AuthService.isLoggedIn()) {
        return {
          error: true,
          message: "Autentikasi diperlukan untuk berlangganan notifikasi",
        };
      }

      const { data } = await this.fetchWithErrorHandling(this.SUBSCRIBE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint,
          keys,
        }),
      });

      return {
        error: false,
        message: "Berhasil berlangganan notifikasi",
      };
    } catch (error) {
      console.error("Error saat berlangganan push notification:", error);
      return {
        error: true,
        message: error.message || "Gagal berlangganan notifikasi",
      };
    }
  }

  /**
   * Berhenti berlangganan push notification
   * @param {Object} data - Data endpoint
   */
  static async unsubscribePushNotification({ endpoint }) {
    try {
      if (!AuthService.isLoggedIn()) {
        return {
          error: true,
          message: "Autentikasi diperlukan untuk berhenti berlangganan",
        };
      }

      const { data } = await this.fetchWithErrorHandling(this.UNSUBSCRIBE, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint,
        }),
      });

      return {
        error: false,
        message: "Berhasil berhenti berlangganan notifikasi",
      };
    } catch (error) {
      console.error(
        "Error saat berhenti berlangganan push notification:",
        error
      );
      return {
        error: true,
        message: error.message || "Gagal berhenti berlangganan notifikasi",
      };
    }
  }
}

export default StoryApi;
