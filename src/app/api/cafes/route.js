import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCached, setCache, buildCacheKey, isLocked } from "@/lib/redis";
import { filterByMood, sortCafes } from "@/lib/filter";
import { addDistanceToCafes, sortByDistance } from "@/lib/geo";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.toLowerCase();
  const mood = searchParams.get("mood");
  const sort = searchParams.get("sort") || "unique";
  const limit = parseInt(searchParams.get("limit") || "20");
  const userLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")) : null;
  const userLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")) : null;

  if (!city) {
    return NextResponse.json({ error: "city parameter is required" }, { status: 400 });
  }

  const hasLocation = userLat != null && userLng != null;
  const cacheKey = buildCacheKey(city, mood, sort + (hasLocation ? `:${userLat},${userLng}` : ""));
  const cached = await getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const cafes = await prisma.cafe.findMany({
    where: { city },
    orderBy: { uniquenessScore: "desc" },
  });

  let filtered = filterByMood(cafes, mood);

  if (hasLocation) {
    filtered = addDistanceToCafes(filtered, userLat, userLng);
  }

  if (sort === "nearest" && hasLocation) {
    filtered = sortByDistance(filtered);
  } else {
    filtered = sortCafes(filtered, sort);
  }

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
      distanceKm: cafe.distanceKm ?? null,
    })),
    lastUpdated: scrapeLog?.scrapedAt?.toISOString() || null,
    scrapingInProgress,
  };

  await setCache(cacheKey, response, 3600);

  return NextResponse.json(response);
}
