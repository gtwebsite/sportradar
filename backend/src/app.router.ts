import express from "express";

export const appRouter = express.Router();

appRouter.get("/", async (req, res) => {
  try {
    // Your query here
    res.status(200).send({});
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});
