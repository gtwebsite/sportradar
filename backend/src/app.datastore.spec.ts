import { expect } from "chai";
import sinon from "sinon";
import { AppDataStore } from "./app.datastore";
import { GameFeed, Status } from "@lib-types";
import type { Game } from "@prisma/client";

describe("AppDataStore", () => {
  let sandbox: sinon.SinonSandbox;
  let gamesFeed = {} as GameFeed;
  let gamesMap = new Map<string, Game>();
  let appDataStore: AppDataStore;
  let feedUrl = "http://";

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    gamesFeed = {
      name: "NHL games feed",
      games: [
        {
          id: "d53c31e5-4639-474d-a9bf-1a93830364a2",
          status: Status.Live,
        },
        {
          id: "cd8ac660-97e5-440e-a730-8c63d2e763e9",
          status: Status.Scheduled,
        },
      ],
    };

    gamesMap.set(
      "d53c31e5-4639-474d-a9bf-1a93830364a2",
      gamesFeed.games[0] as Game
    );
    gamesMap.set(
      "cd8ac660-97e5-440e-a730-8c63d2e763e9",
      gamesFeed.games[0] as Game
    );

    appDataStore = new AppDataStore({ feedUrl });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("getGames", () => {
    it("should return games with live status", () => {
      sandbox.replace(appDataStore as any, "games", gamesMap);

      const res = appDataStore.getGames();
      expect(res).to.be.an("array").that.has.length(2);
      expect(res.every((game) => game.status === Status.Live)).to.be.true;
    });
  });
});
