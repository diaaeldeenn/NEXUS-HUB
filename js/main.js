//^ === 1. API    ===
class GameAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.host = "free-to-play-games-database.p.rapidapi.com";
  }

  async getGames(category) {
    const res = await fetch(
      `https://free-to-play-games-database.p.rapidapi.com/api/games?category=${category}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": this.apiKey,
          "x-rapidapi-host": this.host,
        },
      }
    );
    return await res.json();
  }

  async getGameDetails(id) {
    const res = await fetch(
      `https://free-to-play-games-database.p.rapidapi.com/api/game?id=${id}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": this.apiKey,
          "x-rapidapi-host": this.host,
        },
      }
    );
    return await res.json();
  }
}

//^ === 2. Game List Class ===
class GameList {
  constructor(api, containerSelector, loadingSelector) {
    this.api = api;
    this.container = document.querySelector(containerSelector);
    this.loading = document.querySelector(loadingSelector);
  }

  async showGames(category, onCardClick) {
    this.loading.classList.remove("d-none");
    const games = await this.api.getGames(category);
    this.loading.classList.add("d-none");
    this.renderGames(games, onCardClick);
  }

  renderGames(games, onCardClick) {
    let html = "";
    games.forEach((game) => {
      html += `
              <div class="col-12 col-md-6 col-lg-3">
                <div class="card" data-id="${game.id}">
                  <img src="${game.thumbnail}" class="card-img-top" alt="..." />
                  <div class="card-body">
                    <div class="cart-title d-flex justify-content-between align-items-center">
                      <h5>${game.title}</h5>
                      <span class="badge text-bg-primary p-2">Free</span>
                    </div>
                    <p class="card-text opacity-50">${
                      game.short_description
                    }</p>
                  </div>
                  <hr class="text-black" />
                  <div class="card-body d-flex justify-content-between">
                    <span class="badge badge-color">${game.genre}</span>
                    <span class="badge badge-color">${game.platform
                      .split(" ")
                      .slice(0, 3)
                      .join(" ")}</span>
                  </div>
                </div>
              </div>`;
    });
    this.container.innerHTML = html;

    this.container.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", () => onCardClick(card.dataset.id));
    });
  }
}

//^ === 3. Game Details Class ===
class GameDetails {
  constructor(
    sectionSelector,
    innerSelector,
    gamesSectionSelector,
    loadingSelector
  ) {
    this.section = document.querySelector(sectionSelector);
    this.inner = document.querySelector(innerSelector);
    this.gamesSection = document.querySelector(gamesSectionSelector);
    this.loading = document.querySelector(loadingSelector);
  }

  async showGame(gamePromise) {
    this.loading.classList.remove("d-none");
    const game = await gamePromise;
    this.loading.classList.add("d-none");

    this.gamesSection.classList.add("d-none");
    this.section.classList.remove("d-none");

    this.inner.innerHTML = `
            <header class="d-flex align-items-center justify-content-between">
              <h1 class="text-center h3 py-4">Details Game</h1>
              <button class="btn-close btn-close-white"></button>
            </header>
            <div class="row">
              <div class="col-md-4"><img src="${game.thumbnail}" class="w-100"/></div>
              <div class="col-md-8">
                <h4>Title: ${game.title}</h4>
                <p>Category: <span class="badge text-bg-info">${game.genre}</span></p>
                <p>Platform: <span class="badge text-bg-info">${game.platform}</span></p>
                <p>Status: <span class="badge text-bg-info">${game.status}</span></p>
                <p>${game.description}</p>
                <a class="btn btn-outline-warning" target="_blank" href="${game.game_url}">Show Game</a>
              </div>
            </div>`;

    this.inner
      .querySelector(".btn-close")
      .addEventListener("click", () => this.close());
  }

  close() {
    this.section.classList.add("d-none");
    this.gamesSection.classList.remove("d-none");
  }
}

//^ === initialize ===
const API_KEY = "6a9dfe3cd9msh15401a853034fd4p177bfejsn39aecba0a545";
const api = new GameAPI(API_KEY);
const gameList = new GameList(api, ".innerGames", ".loading");
const gameDetails = new GameDetails(
  ".games-descripe",
  ".my-desc",
  ".games",
  ".loading"
);

//^ handle nav
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document
      .querySelectorAll(".nav-link")
      .forEach((l) => l.classList.remove("active"));
    e.target.classList.add("active");
    const category = e.target.textContent.toLowerCase();
    gameList.showGames(category, (id) =>
      gameDetails.showGame(api.getGameDetails(id))
    );
  });
});

//^ load default category
gameList.showGames("mmorpg", (id) =>
  gameDetails.showGame(api.getGameDetails(id))
);
