import { EventEmitter } from "stream";
import type { GameFeedItem } from "../../shared-types";

export class Event extends EventEmitter {
  status(games: GameFeedItem[]) {
    this.emit("update", games);
  }
}
