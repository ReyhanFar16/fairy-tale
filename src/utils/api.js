import AuthService from "./auth.js";

class StoryApi {
  static BASE_URL = "https://story-api.dicoding.dev/v1";
  static GUEST_API_URL = `${this.BASE_URL}/stories/guest`;
  static AUTH_API_URL = `${this.BASE_URL}/stories`;

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
      // Check if user is logged in
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

      // Only use authenticated endpoint
      const url = `${this.AUTH_API_URL}/${id}`;
      console.log(
        `Getting story detail for ID ${id}, logged in: ${AuthService.isLoggedIn()}`
      );

      // Let fetchWithErrorHandling handle the auth headers
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

      // Add debugging for location data
      const lat = formData.get("lat");
      const lon = formData.get("lon");

      console.log("Location data in request:", { lat, lon });

      // Optional: Validate coordinates if present
      if (lat !== null && lon !== null) {
        // Convert to numbers
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);

        // Basic validation
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
}

export default StoryApi;
