import { openDB } from "idb";

const DATABASE_NAME = "fairy-tale-db";
const DATABASE_VERSION = 1;
const STORIES_STORE = "stories";
const FAVORITES_STORE = "favorites";

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database) => {
    // Create stories store if it doesn't exist
    if (!database.objectStoreNames.contains(STORIES_STORE)) {
      const storyStore = database.createObjectStore(STORIES_STORE, {
        keyPath: "id",
      });
      storyStore.createIndex("by_date", "createdAt", { unique: false });
    }

    // Create favorites store if it doesn't exist
    if (!database.objectStoreNames.contains(FAVORITES_STORE)) {
      const favoritesStore = database.createObjectStore(FAVORITES_STORE, {
        keyPath: "id",
      });
      favoritesStore.createIndex("by_date", "savedAt", { unique: false });
    }
  },
});

const FairyTaleDB = {
  // Stories methods
  async saveStory(story) {
    if (!Object.hasOwn(story, "id")) {
      throw new Error(`'id' is required to save a story`);
    }

    return (await dbPromise).put(STORIES_STORE, story);
  },

  async saveStories(stories) {
    if (!Array.isArray(stories)) {
      return this.saveStory(stories);
    }

    const db = await dbPromise;
    const tx = db.transaction(STORIES_STORE, "readwrite");

    await Promise.all(
      stories.map((story) => {
        if (!Object.hasOwn(story, "id")) {
          throw new Error(`'id' is required for all stories`);
        }
        return tx.store.put(story);
      })
    );

    return await tx.done;
  },

  async getStoryById(id) {
    if (!id) {
      throw new Error(`'id' is required to get story`);
    }

    return (await dbPromise).get(STORIES_STORE, id);
  },

  async getAllStories() {
    return (await dbPromise).getAll(STORIES_STORE);
  },

  async deleteStory(id) {
    if (!id) {
      throw new Error(`'id' is required to delete story`);
    }

    // Also remove from favorites if it exists there
    try {
      await this.removeFavorite(id);
    } catch (e) {
      // Ignore if not in favorites
    }

    return (await dbPromise).delete(STORIES_STORE, id);
  },

  // Favorites methods
  async saveFavorite(story) {
    if (!Object.hasOwn(story, "id")) {
      throw new Error(`'id' is required to save a favorite`);
    }

    // Add timestamp for when saved as favorite
    const favoriteStory = {
      ...story,
      savedAt: story.savedAt || new Date().toISOString(),
    };

    return (await dbPromise).put(FAVORITES_STORE, favoriteStory);
  },

  async getFavoriteById(id) {
    if (!id) {
      throw new Error(`'id' is required to get favorite`);
    }

    return (await dbPromise).get(FAVORITES_STORE, id);
  },

  async getAllFavorites() {
    return (await dbPromise).getAll(FAVORITES_STORE);
  },

  async removeFavorite(id) {
    if (!id) {
      throw new Error(`'id' is required to remove favorite`);
    }

    return (await dbPromise).delete(FAVORITES_STORE, id);
  },

  // Utility methods
  async storyExists(id) {
    if (!id) return false;

    const story = await this.getStoryById(id);
    return !!story;
  },

  async isFavorite(id) {
    if (!id) return false;

    const favorite = await this.getFavoriteById(id);
    return !!favorite;
  },

  async clearAllStories() {
    return (await dbPromise).clear(STORIES_STORE);
  },

  async clearAllFavorites() {
    return (await dbPromise).clear(FAVORITES_STORE);
  },
};

export default FairyTaleDB;
