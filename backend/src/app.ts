import express from "express";
import cors from "cors";
import { appRouter } from "./app.router";

const PORT: number = process.env.PORT
  ? parseInt(process.env.PORT as string, 10)
  : 5001;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", appRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
