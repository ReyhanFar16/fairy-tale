function updateAuthUI() {
  const navMenu = document.getElementById("nav-menu");

  if (window.AuthService && window.AuthService.isLoggedIn()) {
    navMenu.innerHTML = `
        <li><a href="#/" class="nav-link">Home</a></li>
        <li><a href="#/add" class="nav-link">Add Story</a></li>
        <li><a href="#/stories" class="nav-link">Stories</a></li>
        <li><a href="#/map" class="nav-link">Map</a></li>
        <li>
          <a href="#" class="nav-link" id="logout-link">Logout</a>
        </li>
      `;

    document.getElementById("logout-link").addEventListener("click", (e) => {
      e.preventDefault();
      window.AuthService.logout();
      window.location.hash = "#/";

      updateAuthUI();
    });
  } else {
    navMenu.innerHTML = `
        <li><a href="#/register" class="nav-link">Register</a></li>
        <li><a href="#/login" class="nav-link">Login</a></li>
      `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (window.AuthService) {
      updateAuthUI();
    }
  }, 100);
});

window.addEventListener("hashchange", () => {
  setTimeout(() => {
    if (window.AuthService) {
      updateAuthUI();
    }
  }, 100);
});

export { updateAuthUI };
