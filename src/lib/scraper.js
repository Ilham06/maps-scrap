import puppeteer from "puppeteer";
import { SCRAPE_QUERIES } from "./constants";
import { deduplicateCafes, filterAndScoreCafes } from "./filter";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeGoogleMapsQuery(page, query) {
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await delay(2000);

    // Scroll the results feed to load more
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]');
        if (feed) feed.scrollTop = feed.scrollHeight;
      });
      await delay(1500);
    }

    const results = await page.evaluate(() => {
      const items = [];
      const elements = document.querySelectorAll('div[role="feed"] > div');

      for (const el of elements) {
        const nameEl = el.querySelector(".fontHeadlineSmall");
        if (!nameEl) continue;

        const name = nameEl.textContent?.trim();
        if (!name) continue;

        let rating = null;
        let reviewCount = null;
        const ratingEl = el.querySelector('span[role="img"]');
        if (ratingEl) {
          const ariaLabel = ratingEl.getAttribute("aria-label") || "";
          const ratingMatch = ariaLabel.match(/([\d.,]+)/);
          if (ratingMatch) {
            rating = parseFloat(ratingMatch[1].replace(",", "."));
          }
        }

        const textContent = el.textContent || "";
        const reviewMatch = textContent.match(/\(([\d.,]+)\)/);
        if (reviewMatch) {
          reviewCount = parseInt(reviewMatch[1].replace(/[.,]/g, ""));
        }

        let address = null;
        const spans = el.querySelectorAll("span");
        for (const span of spans) {
          const text = span.textContent?.trim() || "";
          if (text.length > 20 && (text.includes("Jl") || text.includes("No") || text.includes("Kec"))) {
            address = text;
            break;
          }
        }

        const isOpen = textContent.includes("Buka") || textContent.includes("Open");

        items.push({ name, rating, reviewCount, address, isOpen });
      }
      return items;
    });

    return results;
  } catch (error) {
    console.error(`Scrape failed for query "${query}":`, error.message);
    return [];
  }
}

export async function scrapeCafes(city) {
  const delayMs = parseInt(process.env.SCRAPER_DELAY_MS || "2000");

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    let allResults = [];

    for (const queryTemplate of SCRAPE_QUERIES) {
      const query = `${queryTemplate} ${city}`;
      console.log(`Scraping: ${query}`);
      const results = await scrapeGoogleMapsQuery(page, query);
      allResults = allResults.concat(
        results.map((r) => ({ ...r, city: city.toLowerCase() }))
      );
      await delay(delayMs);
    }

    const deduplicated = deduplicateCafes(allResults);
    const filtered = filterAndScoreCafes(deduplicated);

    return filtered;
  } finally {
    await browser.close();
  }
}
