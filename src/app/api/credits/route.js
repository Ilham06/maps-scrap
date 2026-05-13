import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  getSessionId,
  getCredits,
  consumeCredit,
  applySessionCookie,
} from "@/lib/credits";

export async function GET(request) {
  let sessionId = getSessionId(request);
  const isNew = !sessionId;
  if (isNew) sessionId = randomUUID();

  const credits = await getCredits(sessionId);
  const response = NextResponse.json({ credits });
  if (isNew) applySessionCookie(response, sessionId);
  return response;
}

export async function POST(request) {
  let sessionId = getSessionId(request);
  const isNew = !sessionId;
  if (isNew) sessionId = randomUUID();

  const { success, remaining } = await consumeCredit(sessionId);

  const response = NextResponse.json(
    { success, remaining },
    { status: success ? 200 : 402 }
  );
  if (isNew) applySessionCookie(response, sessionId);
  return response;
}
