import type { Request, Response } from "express";
import { Cron } from "./cron";
import { Event } from "./event";
import { GameFeed, GameFeedItem, FeedArgs, Status } from "../../shared-types";
import { queryFeed } from "./utils";

export const cron = new Cron();
export const event = new Event();

// Data API store to pull and mutate data
export class AppDataStore {
  private feedUrl = "";
  private games = new Map<string, GameFeedItem>();
  private isLiveFeeding = false;

  constructor(args: { feedUrl: string }) {
    this.feedUrl = args.feedUrl;
  }

  // Query all game feed
  async getAll(): Promise<GameFeedItem[]> {
    const {
      data: { games },
    } = await queryFeed<GameFeed>(this.feedUrl);

    const active: GameFeedItem[] = [];
    for (const game of games) {
      if (game.status === Status.Scheduled) {
        continue;
      }

      active.push(game);
    }

    return active;
  }

  // Query the status of the games' live feed
  liveFeed(): boolean {
    // This should be coming from the DB
    return this.isLiveFeeding;
  }

  // Action to toggle the games' live feed status
  liveFeedToggle({ isLiveFeeding = false }: FeedArgs): boolean {
    const key = "feed";
    this.isLiveFeeding = isLiveFeeding;

    if (isLiveFeeding === false) {
      cron.stop(key);
      this.games.clear();
      return false;
    }

    cron.start(key, "*/3 * * * * *", async () => {
      const {
        data: { games },
      } = await queryFeed<GameFeed>(this.feedUrl);

      if (games.length <= 0) {
        return;
      }

      let isUpdated = false;
      for (let i = 0; i < games.length; i++) {
        const { id, ...game } = games[i];

        if (this.games.get(id)?.status === game.status) {
          continue;
        }

        this.games.set(id, { id, ...game });
        isUpdated = true;
      }

      if (isUpdated) {
        event.status([...this.games.values()]);
      }
    });

    return true;
  }

  // SSE subscription to games feed
  subscribe(_req: Request, res: Response) {
    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    res.flushHeaders();

    event.on("update", (games: GameFeedItem[]) => {
      const active: GameFeedItem[] = [];
      for (const game of games) {
        if (game.status === Status.Scheduled) {
          continue;
        }

        active.push(game);
      }
      res.write(`data: ${JSON.stringify(active)}\n\n`);
    });

    res.on("close", () => {
      res.end();
    });
  }
}
