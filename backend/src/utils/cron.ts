import cron from "node-cron";
import type { ArgumentTypes } from "@lib-types";

export class Cron {
  private jobs = new Map<string, cron.ScheduledTask>();

  start(key: string, ...args: ArgumentTypes<typeof cron.schedule>) {
    const job = cron.schedule(...args);
    this.jobs.set(key, job);
  }

  stop(key: string) {
    const job = this.jobs.get(key);

    if (!job) {
      return;
    }

    job.stop();
  }

  stopAll() {
    this.jobs.forEach((job) => {
      job.stop();
    });
  }
}
