import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCached, setCache, buildCacheKey, isLocked } from "@/lib/redis";
import { filterByMood, sortCafes } from "@/lib/filter";
import { SUPPORTED_CITIES } from "@/lib/constants";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.toLowerCase();
  const mood = searchParams.get("mood");
  const sort = searchParams.get("sort") || "unique";
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!city) {
    return NextResponse.json({ error: "city parameter is required" }, { status: 400 });
  }

  const validCity = SUPPORTED_CITIES.find((c) => c.id === city);
  if (!validCity) {
    return NextResponse.json({ error: "unsupported city" }, { status: 400 });
  }

  const cacheKey = buildCacheKey(city, mood, sort);
  const cached = await getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const cafes = await prisma.cafe.findMany({
    where: { city },
    orderBy: { uniquenessScore: "desc" },
  });

  let filtered = filterByMood(cafes, mood);
  filtered = sortCafes(filtered, sort);
  filtered = filtered.slice(0, limit);

  const scrapeLog = await prisma.scrapeLog.findFirst({
    where: { city },
    orderBy: { scrapedAt: "desc" },
  });

  const scrapingInProgress = await isLocked(`scrape:${city}`);

  const response = {
    city,
    total: filtered.length,
    cafes: filtered.map((cafe) => ({
      ...cafe,
      moodTags: cafe.moodTags ? JSON.parse(cafe.moodTags) : [],
    })),
    lastUpdated: scrapeLog?.scrapedAt?.toISOString() || null,
    scrapingInProgress,
  };

  await setCache(cacheKey, response, 3600);

  return NextResponse.json(response);
}
