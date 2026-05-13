import { randomUUID } from "crypto";
import { getRedisClient } from "./redis";

const INITIAL_CREDITS = 5;
const CREDIT_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
export const SESSION_COOKIE = "wfc_sid";

// Atomic: check-then-decrement. Returns [success 0|1, remaining].
// If key doesn't exist, treats as full credits and decrements from INITIAL-1.
const CONSUME_SCRIPT = `
local key = KEYS[1]
local ttl = tonumber(ARGV[1])
local init = tonumber(ARGV[2])
local val = redis.call('GET', key)
if not val then
  redis.call('SET', key, init - 1, 'EX', ttl)
  return {1, init - 1}
end
local n = tonumber(val)
if n <= 0 then return {0, 0} end
local new = redis.call('DECR', key)
redis.call('EXPIRE', key, ttl)
return {1, new}
`;

export function getSessionId(request) {
  return request.cookies.get(SESSION_COOKIE)?.value ?? null;
}

export function applySessionCookie(response, sessionId) {
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  return response;
}

export async function getCredits(sessionId) {
  const client = getRedisClient();
  if (!client) return INITIAL_CREDITS;
  try {
    const val = await client.get(`credits:${sessionId}`);
    if (val === null) return INITIAL_CREDITS;
    return Math.max(0, parseInt(val, 10));
  } catch {
    return INITIAL_CREDITS;
  }
}

export async function consumeCredit(sessionId) {
  const client = getRedisClient();
  if (!client) return { success: true, remaining: INITIAL_CREDITS - 1 };
  try {
    const result = await client.eval(
      CONSUME_SCRIPT,
      1,
      `credits:${sessionId}`,
      String(CREDIT_TTL),
      String(INITIAL_CREDITS)
    );
    return { success: result[0] === 1, remaining: result[1] };
  } catch {
    return { success: true, remaining: INITIAL_CREDITS - 1 };
  }
}

export { randomUUID, INITIAL_CREDITS };
