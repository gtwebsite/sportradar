import type { Request, Response } from "express";
import { Game, Player, PrismaClient } from "@prisma/client";
import { GameFeed, FeedArgs, Status } from "@lib-types";
import { queryFeed, Cron, Event } from "./utils";

export const cron = new Cron();
export const event = new Event();
event.setMaxListeners(0);
export const prisma = new PrismaClient();

// Data API store to pull and mutate data
export class AppDataStore {
  private feedUrl = "";
  private games = new Map<string, Game>();
  private players: Player[] = [];
  private isLiveFeeding = false;

  constructor(args: { feedUrl: string }) {
    this.feedUrl = args.feedUrl;
  }

  // Query active game feed
  getGames(): Game[] {
    return [...this.games.values()]?.filter(
      (game) => game.status === Status.Live
    );
  }

  // Query active players feed
  getPlayers(id: string): Player[] {
    return this.players.filter((player) => player.gameId === id);
  }

  // Query the status of the games' live feed
  liveFeed(): boolean {
    // This should be coming from the DB
    return this.isLiveFeeding;
  }

  // Action to toggle the games' live feed status
  liveFeedToggle({ isLiveFeeding = false }: FeedArgs): boolean {
    const gamesFeed = "gamesFeed";
    const playersFeed = "playersFeed";
    this.isLiveFeeding = isLiveFeeding;

    // Clean up when live feeding stopped
    if (isLiveFeeding === false) {
      cron.stop(gamesFeed);
      cron.stop(playersFeed);
      this.games.clear();
      this.players = [];
      return false;
    }

    // Run cron games every 3 seconds
    this.cronGames(gamesFeed);

    // Run cron players every 3 seoncds
    this.cronPlayers(playersFeed);

    return true;
  }

  // Cron job for games
  cronGames(key: string, cronExpression: string = "*/3 * * * * *") {
    cron.start(key, cronExpression, async () => {
      const {
        data: { games },
      } = await queryFeed<GameFeed>(`${this.feedUrl}/feed-games.json`);

      if (games.length <= 0) {
        return;
      }

      let isUpdated = false;
      for (let i = 0; i < games.length; i++) {
        const { id, ...game } = games[i];

        if (this.games.get(id)?.status === game.status) {
          continue;
        }

        this.games.set(id, {
          id,
          ...game,
          dateTimeStarted: null,
          dateTimeEnded: null,
        });
        isUpdated = true;
      }

      if (!isUpdated) {
        return;
      }

      event.gameEvent([...this.games.values()]);
    });
  }

  // Cron job for players
  cronPlayers(key: string, cronExpression: string = "*/3 * * * * *") {
    cron.start(key, cronExpression, async () => {
      const gamesLive = [];

      for (const [key, value] of this.games) {
        if (value.status === Status.Live) {
          gamesLive.push(value.id);
        }
      }

      if (gamesLive.length <= 0) {
        return;
      }

      const feed = await this.getPlayerFeed(gamesLive);

      const players = await this.playersUpSert(feed);

      if (players.length <= 0) {
        return;
      }

      this.players = players;
      event.playerEvent(players);
    });
  }

  // SSE subscription to games feed
  subscribeGameEvent(_req: Request, res: Response) {
    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    res.flushHeaders();

    event.on("gameEventUpdate", (games: Game[]) => {
      res.write(
        `data: ${JSON.stringify(
          games?.filter((game) => game.status === Status.Live)
        )}\n\n`
      );
    });

    res.on("close", () => {
      res.end();
    });
  }

  // SSE subscription to player feed
  subscribePlayerEvent(req: Request<{ id: string }>, res: Response) {
    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    res.flushHeaders();

    event.on("playerEventUpdate", (players: Player[]) => {
      res.write(
        `data: ${JSON.stringify(
          players?.filter((player) => player.gameId === req.params.id)
        )}\n\n`
      );
    });

    res.on("close", () => {
      res.end();
    });
  }

  // Run mutation
  async mutateAll() {
    event.on("gameEventUpdate", async (games: Game[]) => {
      if (!games || games.length <= 0) {
        return;
      }

      const gamesLive = games.reduce((acc, game) => {
        if (game.status !== Status.Live) {
          return acc;
        }

        return [...acc, game.id];
      }, [] as string[]);

      const [feeds] = await Promise.all([
        this.getPlayerFeed(gamesLive),
        this.gamesUpSert(games),
      ]);

      await this.playersUpSert(feeds);
    });
  }

  // Get player feed
  async getPlayerFeed(games: string[]) {
    if (games.length <= 0) {
      return [];
    }

    const players = await Promise.all(
      games.map(async (game) => {
        const {
          data: { players },
        } = await queryFeed<{
          name: string;
          players: Player[];
        }>(`${this.feedUrl}/feed-players-${game}.json`);
        return players.map((player) => ({
          ...player,
          playerId: player.id || "",
          gameId: game,
        }));
      })
    );
    return players
      .flat()
      ?.filter((player) => games.includes(player.gameId)) as Player[];
  }

  // Updated/Create games
  async gamesUpSert(games: Game[]) {
    if (games.length <= 0) {
      return [];
    }

    const transactions = await prisma.$transaction(async (context) =>
      games.map((game) =>
        prisma.game.upsert({
          where: { id: game.id },
          update: game,
          create: game,
        })
      )
    );

    return Promise.all(transactions.flat());
  }

  // Updated/Create players
  async playersUpSert(players: Player[]) {
    if (players.length <= 0) {
      return [];
    }

    const transactions = await prisma.$transaction(async () =>
      players.map((player) =>
        prisma.player.upsert({
          where: {
            id: player.id,
          },
          update: player,
          create: player,
        })
      )
    );

    return Promise.all(transactions.flat());
  }
}
