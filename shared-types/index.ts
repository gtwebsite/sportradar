export type ArgumentTypes<F extends Function> = F extends (
  ...args: infer A
) => any
  ? A
  : never;

export interface FeedArgs {
  isLiveFeeding: boolean;
}

export interface GameFeed {
  name: string;
  games: GameFeedItem[];
}

export interface GameFeedItem {
  id: string;
  status: Status;
}

export enum Status {
  Live = "Live",
  Scheduled = "Scheduled",
  Ended = "Ended",
}
