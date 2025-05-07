//* ---- API Dicoding ----

const endpoint = "https://story-api.dicoding.dev/v1/#/";

class StoryApi {
  static async getStories() {
    try {
      const response = await fetch(`${endpoint}/stories`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        error: false,
        stories: data.listStory || [],
      };
    } catch (error) {
      console.log(`Error fetching stories: ${error}`);
      return {
        error: true,
        message: error.message,
      };
    }
  }

  static async getStoryDetail(id) {
    try {
      const response = await fetch(`${endpoint}/stories/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseJson = await response.json();
      return {
        error: false,
        story: responseJson.story,
      };
    } catch (error) {
      console.error(`Error fetching story detail ${error}`);
      return { error: true, message: error.message };
    }
  }

  static async addNewStory(formData) {
    try {
      const response = await fetch(`${endpoint}/stories`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error adding new story: ${error}`);
      return { error: true, message: error.message };
    }
  }
}

export default StoryApi;
