"use server";

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_API_KEY!,
});

export async function redisGet(key: string) {
  const res = await redis.get(key);
  return typeof res === "string" ? res : null;
}

export async function redisSet(key: string, value: string) {
  return await redis.set(key, value);
}
