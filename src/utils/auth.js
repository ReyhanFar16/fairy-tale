class AuthService {
  static API_URL = "https://story-api.dicoding.dev/v1";
  static TOKEN_KEY = "storyAppToken";
  static USER_KEY = "storyAppUser";

  /**
   * Register a new user
   * @param {string} name - User's name
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<object>} Response object
   */
  static async register(name, email, password) {
    try {
      const response = await fetch(`${this.API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Registration failed");
      }

      return {
        error: false,
        message: responseData.message,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        error: true,
        message: error.message || "Registration failed",
      };
    }
  }

  /**
   * Login user and store token
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<object>} Response with token and user data
   */
  static async login(email, password) {
    try {
      const response = await fetch(`${this.API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Login failed");
      }

      // Store token and user data
      this.saveToken(responseData.loginResult.token);
      this.saveUser({
        userId: responseData.loginResult.userId,
        name: responseData.loginResult.name,
      });

      return {
        error: false,
        token: responseData.loginResult.token,
        user: {
          userId: responseData.loginResult.userId,
          name: responseData.loginResult.name,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        error: true,
        message: error.message || "Login failed",
      };
    }
  }

  /**
   * Save token to localStorage
   * @param {string} token - JWT token
   */
  static saveToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Get token from localStorage
   * @returns {string|null} JWT token or null if not found
   */
  static getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Save user data to localStorage
   * @param {object} user - User data
   */
  static saveUser(user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user data from localStorage
   * @returns {object|null} User data or null if not found
   */
  static getUser() {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is logged in
   * @returns {boolean} True if logged in, false otherwise
   */
  static isLoggedIn() {
    return !!this.getToken();
  }

  /**
   * Logout user and clear storage
   */
  static logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}

export default AuthService;
