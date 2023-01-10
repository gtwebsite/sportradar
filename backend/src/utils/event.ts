import type { Game, Player } from "@prisma/client";
import { EventEmitter } from "stream";
import type { GameFeedItem } from "../../../shared-types";

export class Event extends EventEmitter {
  gameEvent(games: Game[]) {
    this.emit("gameEventUpdate", games);
  }

  playerEvent(players: Player[]) {
    this.emit("playerEventUpdate", players);
  }
}
