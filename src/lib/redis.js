import Redis from "ioredis";

let redis = null;

export function getRedisClient() {
  if (redis) return redis;

  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });

    redis.on("error", () => {
      // Silently handle Redis errors - app works without Redis
    });

    return redis;
  } catch {
    return null;
  }
}

export async function getCached(key) {
  try {
    const client = getRedisClient();
    if (!client) return null;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCache(key, data, ttlSeconds = 3600) {
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch {
    // Cache miss is acceptable
  }
}

export async function acquireLock(key, ttlSeconds = 600) {
  try {
    const client = getRedisClient();
    if (!client) return true; // If no Redis, allow operation
    const result = await client.set(key, "locked", "EX", ttlSeconds, "NX");
    return result === "OK";
  } catch {
    return true;
  }
}

export async function releaseLock(key) {
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.del(key);
  } catch {
    // Ignore errors
  }
}

export async function isLocked(key) {
  try {
    const client = getRedisClient();
    if (!client) return false;
    const result = await client.exists(key);
    return result === 1;
  } catch {
    return false;
  }
}

export function buildCacheKey(city, mood, sort) {
  const parts = ["cafes", city];
  if (mood) parts.push(mood);
  if (sort) parts.push(sort);
  return parts.join(":");
}
