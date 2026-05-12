-- CreateTable
CREATE TABLE "Cafe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "rating" REAL,
    "reviewCount" INTEGER,
    "address" TEXT,
    "isOpen" BOOLEAN,
    "uniquenessScore" INTEGER,
    "wfcScore" INTEGER,
    "vibeDescription" TEXT,
    "moodTags" TEXT,
    "highlightFeature" TEXT,
    "warningFlag" TEXT,
    "aiAnalyzed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScrapeLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "city" TEXT NOT NULL,
    "cafeCount" INTEGER NOT NULL,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Cafe_city_idx" ON "Cafe"("city");

-- CreateIndex
CREATE INDEX "Cafe_city_wfcScore_idx" ON "Cafe"("city", "wfcScore");

-- CreateIndex
CREATE INDEX "Cafe_city_uniquenessScore_idx" ON "Cafe"("city", "uniquenessScore");

-- CreateIndex
CREATE UNIQUE INDEX "Cafe_name_city_key" ON "Cafe"("name", "city");

-- CreateIndex
CREATE INDEX "ScrapeLog_city_idx" ON "ScrapeLog"("city");
