import express from "express";
import type { Request, Response } from "express";
import { AppDataStore } from "./app.datastore";
import type { FeedArgs, GameFeedItem } from "../../shared-types";

export const appRouter = express.Router();
export const datastore = new AppDataStore({
  feedUrl: "http://localhost:3001/feed-games.json",
});

appRouter.get("/all", async (_req, res: Response<GameFeedItem[] | Error>) => {
  try {
    const feed = await datastore.getAll();
    res.status(200).send(feed);
  } catch (e) {
    res.status(500).send(e as unknown as Error);
  }
});

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

appRouter.get("/subscribe", async (req, res) => {
  if (req.headers.accept === "text/event-stream") {
    datastore.subscribe(req, res);
  } else {
    res.status(200).send({ message: "ok" });
  }
});
