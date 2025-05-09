import AuthService from "./auth.js";

// Export services to window object for global access
window.AuthService = AuthService;
console.log("AuthService exported to window");
