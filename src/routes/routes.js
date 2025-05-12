//* --- Pages --- */
import HomePage from "../pages/home/home-page.js";
import AddStoryPage from "../pages/story/add-story-page.js";
import StoryListPage from "../pages/story/story-list-page.js";
import LoginPage from "../pages/auth/login-page.js";
import RegisterPage from "../pages/auth/register-page.js";
import StoryMapPage from "../pages/story-map/story-map-page.js";

//* --- Presenters --- */
import HomePresenter from "../presenters/home-presenter.js";
import AddStoryPresenter from "../presenters/add-story-presenter.js";
import StoryListPresenter from "../presenters/story-list-presenter.js";
import LoginPresenter from "../presenters/login-presenter.js";
import RegisterPresenter from "../presenters/register-presenter.js";
import StoryMapPresenter from "../presenters/story-map-presenter.js";

const routes = {
  "/": () => {
    const homePage = new HomePage();
    const homePresenter = new HomePresenter(homePage);
    homePage.setPresenter(homePresenter);

    setTimeout(() => {
      homePresenter.init();
    }, 0);

    return homePage;
  },

  "/login": () => {
    const loginPage = new LoginPage();
    const loginPresenter = new LoginPresenter(loginPage);
    loginPage.setPresenter(loginPresenter);

    setTimeout(() => {
      loginPresenter.init();
    }, 0);

    return loginPage;
  },

  "/add": () => {
    const addStoryPage = new AddStoryPage();
    const addStoryPresenter = new AddStoryPresenter(addStoryPage);
    addStoryPage.setPresenter(addStoryPresenter);

    setTimeout(() => {
      addStoryPresenter.init();
    }, 0);

    return addStoryPage;
  },

  "/stories": () => {
    const storyListPage = new StoryListPage();
    const storyListPresenter = new StoryListPresenter(storyListPage);
    storyListPage.setPresenter(storyListPresenter);

    setTimeout(() => {
      storyListPresenter.init();
    }, 0);

    return storyListPage;
  },

  "/stories/:id": () => {
    return document.createElement("div");
  },

  "/register": () => {
    const registerPage = new RegisterPage();
    const registerPresenter = new RegisterPresenter(registerPage);
    registerPage.setPresenter(registerPresenter);

    setTimeout(() => {
      registerPresenter.init();
    }, 0);

    return registerPage;
  },

  "/map": () => {
    const storyMapPage = new StoryMapPage();
    const storyMapPresenter = new StoryMapPresenter(storyMapPage);
    storyMapPage.setPresenter(storyMapPresenter);

    setTimeout(() => {
      storyMapPresenter.init();
    }, 0);

    return storyMapPage;
  },
};

export default routes;
