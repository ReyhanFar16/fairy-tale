import HomePage from "../pages/home/home-page.js";
import AddStoryPage from "../pages/story/add-story-page.js";
import StoryListPage from "../pages/story/story-list-page.js";
import LoginPage from "../pages/auth/login-page.js";
import RegisterPage from "../pages/auth/register-page.js";
// import RegisterPage from "../pages/auth/register-page.js"; // Add when you create this

import HomePresenter from "../presenters/home-presenter.js";
import AddStoryPresenter from "../presenters/add-story-presenter.js";
import StoryListPresenter from "../presenters/story-list-presenter.js";
import LoginPresenter from "../presenters/login-presenter.js";
import RegisterPresenter from "../presenters/register-presenter.js";

// import RegisterPresenter from "../presenters/register-presenter.js"; // Add when you create this

const routes = {
  "/": () => {
    const homePage = new HomePage();
    const homePresenter = new HomePresenter(homePage);
    homePage.setPresenter(homePresenter);

    // Initialize presenter after rendering
    setTimeout(() => {
      homePresenter.init();
    }, 0);

    return homePage;
  },

  "/login": () => {
    const loginPage = new LoginPage();
    const loginPresenter = new LoginPresenter(loginPage);
    loginPage.setPresenter(loginPresenter);

    // Initialize presenter after rendering
    setTimeout(() => {
      loginPresenter.init();
    }, 0);

    return loginPage;
  },

  // "/register": () => {
  //   const registerPage = new RegisterPage();
  //   const registerPresenter = new RegisterPresenter(registerPage);
  //   registerPage.setPresenter(registerPresenter);

  //   // Initialize presenter after rendering
  //   setTimeout(() => {
  //     registerPresenter.init();
  //   }, 0);

  //   return registerPage;
  // },

  "/add": () => {
    const addStoryPage = new AddStoryPage();
    const addStoryPresenter = new AddStoryPresenter(addStoryPage);
    addStoryPage.setPresenter(addStoryPresenter);

    // Initialize presenter after rendering
    setTimeout(() => {
      addStoryPresenter.init();
    }, 0);

    return addStoryPage;
  },

  "/stories": () => {
    const storyListPage = new StoryListPage();
    const storyListPresenter = new StoryListPresenter(storyListPage);
    storyListPage.setPresenter(storyListPresenter);

    // Initialize presenter after rendering
    setTimeout(() => {
      storyListPresenter.init();
    }, 0);

    return storyListPage;
  },

  "/stories/:id": () => {
    // Implementasi detail story akan ditambahkan nanti
    return document.createElement("div");
  },

  "/register": () => {
    const registerPage = new RegisterPage();
    const registerPresenter = new RegisterPresenter(registerPage);
    registerPage.setPresenter(registerPresenter);

    // Initialize presenter after rendering
    setTimeout(() => {
      registerPresenter.init();
    }, 0);

    return registerPage;
  },
};

export default routes;
