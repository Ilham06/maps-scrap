"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import CitySelector from "@/components/CitySelector";
import FilterBar from "@/components/FilterBar";
import CafeCard from "@/components/CafeCard";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

export default function ResultsClient({ city, cityData }) {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrapingInProgress, setScrapingInProgress] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [mood, setMood] = useState(null);
  const [sort, setSort] = useState("unique");
  const [error, setError] = useState(null);

  const fetchCafes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ city });
      if (mood) params.set("mood", mood);
      params.set("sort", sort);

      const res = await fetch(`/api/cafes?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setCafes(data.cafes || []);
      setScrapingInProgress(data.scrapingInProgress || false);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [city, mood, sort]);

  const triggerScrape = async () => {
    try {
      const res = await fetch("/api/scraper/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      });
      const data = await res.json();

      if (data.status === "started") {
        setScrapingInProgress(true);
        setTimeout(fetchCafes, 5000);
      }
    } catch {
      // Ignore trigger errors
    }
  };

  useEffect(() => {
    fetchCafes();
  }, [fetchCafes]);

  useEffect(() => {
    if (!scrapingInProgress) return;
    const interval = setInterval(fetchCafes, 10000);
    return () => clearInterval(interval);
  }, [scrapingInProgress, fetchCafes]);

  const resetFilters = () => {
    setMood(null);
    setSort("unique");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Link href="/" className="text-lg font-bold hover:opacity-80">
              &#9749; WFC Cafe Finder
            </Link>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Update: {new Date(lastUpdated).toLocaleDateString("id-ID")}
              </span>
            )}
          </div>
          <CitySelector activeCity={city} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* City Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {cityData.emoji} Cafe di {cityData.label}
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={triggerScrape}
            disabled={scrapingInProgress}
          >
            {scrapingInProgress ? "Scraping..." : "Refresh Data"}
          </Button>
        </div>

        {scrapingInProgress && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm text-center">
            Sedang mencari cafe baru di {cityData.label}... Data akan otomatis
            terupdate.
          </div>
        )}

        {/* Filters */}
        <FilterBar
          activeMood={mood}
          activeSort={sort}
          onMoodChange={setMood}
          onSortChange={setSort}
          totalCount={cafes.length}
        />

        {/* Results */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <EmptyState
            message="Gagal memuat data cafe"
            onReset={fetchCafes}
          />
        ) : cafes.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cafes.map((cafe) => (
              <CafeCard key={cafe.id} cafe={cafe} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
