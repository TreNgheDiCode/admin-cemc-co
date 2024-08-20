import { Redis } from "@upstash/redis";
import { getDate } from "./utils";
import { parse } from "date-fns";

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.UPSTASH_TOKEN,
});

type AnalyticsArg = {
  retention?: number;
};

type AnalyticPromises = ReturnType<typeof analytics.retrieve>;

export class Analytics {
  private retention = 60 * 60 * 24 * 7; // 7 days

  constructor(opts?: AnalyticsArg) {
    if (opts?.retention) {
      this.retention = opts.retention;
    }
  }

  setRetention(retention: number) {
    this.retention = retention;
  }

  async retrieveDays(namespace: string, days: number) {
    const promises: AnalyticPromises[] = [];

    for (let i = 0; i < days; i++) {
      const date = getDate(i);
      promises.push(this.retrieve(namespace, date));
    }

    const fetched = await Promise.all(promises);

    const data = fetched.sort((a, b) => {
      if (
        parse(a.date, "dd/MM/yyyy", new Date()) >
        parse(b.date, "dd/MM/yyyy", new Date())
      ) {
        return 1;
      } else {
        return -1;
      }
    });

    return data;
  }

  async retrieve(namespace: string, date: string) {
    const res = await redis.hgetall<Record<string, string>>(
      `analytics::${namespace}::${date}`
    );

    return {
      date,
      events: Object.entries(res ?? []).map(([key, value]) => ({
        [key]: Number(value),
      })),
    };
  }
}

export class AnalyticsSingleton {
  private static instance: Analytics | null = null;

  private constructor() {}

  static getInstance(): Analytics {
    if (!AnalyticsSingleton.instance) {
      AnalyticsSingleton.instance = new Analytics();
    }
    return AnalyticsSingleton.instance;
  }
}

export const analytics = AnalyticsSingleton.getInstance();
