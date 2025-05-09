const template = {
  // Update template addStoryPage
  addStoryPage: () => `
<div class="add-story-container">
  <h2 class="page-title">Share Your Story</h2>
  <form id="add-story-form" class="story-form">
    <div class="form-group">
      <label for="story-description">Description</label>
      <textarea id="story-description" name="description" required rows="4" placeholder="Share your story here..."></textarea>
    </div>
    
    <div class="form-group">
      <label>Image (required, max 1MB)</label>
      <div class="image-upload-container">
        <div class="upload-options">
          <button type="button" id="camera-button" class="btn btn-secondary">
            Take Photo
          </button>
          <label for="file-input" class="btn btn-secondary">
            Upload Image
          </label>
          <input type="file" id="file-input" name="file" accept="image/*" hidden>
        </div>
        <div class="image-preview-container">
          <img id="image-preview" src="#" alt="Preview" style="display: none;">
          <p id="no-image-text">No image selected yet</p>
        </div>
      </div>
    </div>
    
    <div class="form-group">
      <label>Location (optional)</label>
      <div class="location-picker">
        <div id="map-container" style="height: 300px;"></div>
        <div class="location-info">
          <p>Selected Location: <span id="selected-location">None</span></p>
          <p>Coordinates: <span id="coordinates">Not selected</span></p>
          <button type="button" id="use-my-location" class="btn btn-secondary">
            Use My Location
          </button>
        </div>
      </div>
    </div>
    
    <div class="form-actions">
      <button type="submit" id="submit-story" class="btn btn-primary">Share Story</button>
    </div>
  </form>
</div>
`,
};

export default template;
