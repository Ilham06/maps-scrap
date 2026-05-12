import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { acquireLock, releaseLock } from "@/lib/redis";
import { scrapeCafes } from "@/lib/scraper";
import { analyzeCafeBatch } from "@/lib/openai";
import { SUPPORTED_CITIES } from "@/lib/constants";

export async function POST(request) {
  const body = await request.json();
  const city = body.city?.toLowerCase();

  if (!city) {
    return NextResponse.json({ error: "city is required" }, { status: 400 });
  }

  const validCity = SUPPORTED_CITIES.find((c) => c.id === city);
  if (!validCity) {
    return NextResponse.json({ error: "unsupported city" }, { status: 400 });
  }

  const cacheHours = parseInt(process.env.CACHE_HOURS || "24");
  const lastScrape = await prisma.scrapeLog.findFirst({
    where: { city },
    orderBy: { scrapedAt: "desc" },
  });

  if (lastScrape) {
    const hoursSince = (Date.now() - lastScrape.scrapedAt.getTime()) / 3600000;
    if (hoursSince < cacheHours) {
      return NextResponse.json({ status: "fresh", lastUpdated: lastScrape.scrapedAt });
    }
  }

  const lockKey = `scrape:${city}`;
  const locked = await acquireLock(lockKey, 600);
  if (!locked) {
    return NextResponse.json({ status: "in_progress" });
  }

  // Run scraping in background (don't await in response)
  runScrapeJob(city, lockKey).catch((error) => {
    console.error(`Scrape job failed for ${city}:`, error);
    releaseLock(lockKey);
  });

  return NextResponse.json({ status: "started" });
}

async function runScrapeJob(city, lockKey) {
  try {
    console.log(`Starting scrape for ${city}...`);
    const cafes = await scrapeCafes(city);
    console.log(`Found ${cafes.length} cafes in ${city}`);

    for (const cafe of cafes) {
      await prisma.cafe.upsert({
        where: { name_city: { name: cafe.name, city: cafe.city } },
        update: {
          rating: cafe.rating,
          reviewCount: cafe.reviewCount,
          address: cafe.address,
          latitude: cafe.latitude,
          longitude: cafe.longitude,
          isOpen: cafe.isOpen,
          uniquenessScore: cafe.uniquenessScore,
        },
        create: {
          name: cafe.name,
          city: cafe.city,
          rating: cafe.rating,
          reviewCount: cafe.reviewCount,
          address: cafe.address,
          latitude: cafe.latitude,
          longitude: cafe.longitude,
          isOpen: cafe.isOpen,
          uniquenessScore: cafe.uniquenessScore,
        },
      });
    }

    await prisma.scrapeLog.create({
      data: { city, cafeCount: cafes.length },
    });

    // AI analysis for unanalyzed cafes
    const unanalyzed = await prisma.cafe.findMany({
      where: { city, aiAnalyzed: false },
      take: 10,
    });

    if (unanalyzed.length > 0) {
      console.log(`Analyzing ${unanalyzed.length} cafes with AI...`);
      const analyses = await analyzeCafeBatch(unanalyzed);

      for (const analysis of analyses) {
        await prisma.cafe.update({
          where: { id: analysis.id },
          data: {
            wfcScore: analysis.wfcScore,
            vibeDescription: analysis.vibeDescription,
            moodTags: analysis.moodTags,
            highlightFeature: analysis.highlightFeature,
            warningFlag: analysis.warningFlag,
            aiAnalyzed: true,
          },
        });
      }
    }

    console.log(`Scrape job completed for ${city}`);
  } finally {
    await releaseLock(lockKey);
  }
}
