import { expect } from "chai";
import sinon from "sinon";
import { AppDataStore } from "./app.datastore";
import { GameFeed, Status } from "@lib-types";
import type { Game, Player } from "@prisma/client";

describe("AppDataStore", () => {
  let sandbox: sinon.SinonSandbox;
  let queryFeedStub: sinon.SinonStub;

  let gamesFeed = {} as GameFeed;
  let gamesMap = new Map<string, Game>();

  let playersFeed = [] as Player[];

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

    playersFeed = [
      {
        id: "68ea94a3-7724-415d-909a-cd0db8aaf204",
        playerId: "68ea94a3-7724-415d-909a-cd0db8aaf204",
        gameId: "cd8ac660-97e5-440e-a730-8c63d2e763e9",
        playerName: "John Doe",
        team: "Boston Bruins",
        playerAge: 25,
        playerNumber: 23,
        playerPosition: "Goalie",
        assists: 0,
        goals: 3,
        hits: 0,
        points: 1,
        penalityInMinutes: 0,
        opponent: "Dallas Stars",
      },
    ];

    appDataStore = new AppDataStore({ feedUrl });
    queryFeedStub = sinon.stub(appDataStore as any, "queryFeed");
  });

  afterEach(() => {
    sandbox.restore();
    queryFeedStub.restore();
  });

  describe("getGames", () => {
    it("should return games with live status", () => {
      sandbox.replace(appDataStore as any, "games", gamesMap);

      const res = appDataStore.getGames();
      expect(res).to.be.an("array").that.has.length(2);
      expect(res.every((game) => game.status === Status.Live)).to.be.true;
    });
  });

  describe("getPlayerFeed", () => {
    it("should return an empty array if games is empty", async () => {
      const players = await appDataStore.getPlayerFeed([]);
      expect(players).to.be.empty;
    });

    it("should return players from the feed", async () => {
      queryFeedStub.resolves({
        data: { players: playersFeed },
      });

      const players = await appDataStore.getPlayerFeed([
        "cd8ac660-97e5-440e-a730-8c63d2e763e9",
      ]);

      expect(players).to.deep.equal(playersFeed);
    });
  });
});
