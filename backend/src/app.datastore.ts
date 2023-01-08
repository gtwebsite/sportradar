import type { Request, Response } from "express";
import axios from "axios";
import { Cron } from "./cron";
import { Event } from "./event";
import { GameFeed, GameFeedItem, FeedArgs, Status } from "../../shared-types";

export const cron = new Cron();
export const event = new Event();

export async function queryFeed<T extends {}>(url: string) {
  return await axios.get<T>(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function getGamesUpdated(
  games: GameFeedItem[],
  gamesMap: Map<string, GameFeedItem>
): GameFeedItem[] {
  return [];
}

export class AppDataStore {
  private feedUrl = "";
  private games = new Map<string, GameFeedItem>();
  private isLiveFeeding = false;

  constructor(args: { feedUrl: string }) {
    this.feedUrl = args.feedUrl;
  }

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

  liveFeed(): boolean {
    return this.isLiveFeeding;
  }

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
