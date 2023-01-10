import express from "express";
import type { Request, Response } from "express";
import { AppDataStore } from "./app.datastore";
import type { FeedArgs } from "@lib-types";
import type { Game, Player } from "@prisma/client";

export const appRouter = express.Router();
export const datastore = new AppDataStore({
  feedUrl: "http://localhost:3001",
});

// Run live feed immediately
datastore.liveFeedToggle({ isLiveFeeding: true });

// Run mutation from events
datastore.mutateAll();

appRouter.get("/games", (_req, res: Response<Game[] | Error>) => {
  try {
    const feed = datastore.getGames();
    res.status(200).send(feed);
  } catch (e) {
    res.status(500).send(e as unknown as Error);
  }
});

appRouter.get(
  "/players/:id",
  (req: Request<{ id: string }>, res: Response<Player[] | Error>) => {
    try {
      const feed = datastore.getPlayers(req.params.id);
      res.status(200).send(feed);
    } catch (e) {
      res.status(500).send(e as unknown as Error);
    }
  }
);

appRouter.get("/liveFeed", (_req, res: Response<boolean>) => {
  res.status(200).send(datastore.liveFeed());
});

appRouter.post(
  "/liveFeedToggle",
  (req: Request<any, any, FeedArgs>, res: Response<boolean>) => {
    const args = req.body;
    const feed = datastore.liveFeedToggle(args);
    res.status(200).send(feed);
  }
);

appRouter.get("/subscribeGames", async (req, res) => {
  if (req.headers.accept === "text/event-stream") {
    datastore.subscribeGameEvent(req, res);
  } else {
    res.status(200).send({ message: "ok" });
  }
});

appRouter.get(
  "/subscribePlayers/:id",
  async (req: Request<{ id: string }>, res) => {
    if (!req.params.id) {
      res.status(500).send({ error: 1, message: "Required game ID" });
      return;
    }

    if (req.headers.accept === "text/event-stream") {
      datastore.subscribePlayerEvent(req, res);
    } else {
      res.status(200).send({ message: "ok" });
    }
  }
);
