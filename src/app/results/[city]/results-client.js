"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import CitySelector from "@/components/CitySelector";
import AiSearchBar from "@/components/AiSearchBar";
import CafeCard from "@/components/CafeCard";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import useGeolocation from "@/hooks/useGeolocation";

export default function ResultsClient({ city, cityData }) {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [scrapingInProgress, setScrapingInProgress] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [aiMessage, setAiMessage] = useState(null);
  const [activeQuery, setActiveQuery] = useState(null);

  const {
    location,
    loading: locationLoading,
    error: locationError,
    requestLocation,
  } = useGeolocation();

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const fetchAllCafes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ city, sort: "nearest" });
      if (location) {
        params.set("lat", location.lat.toString());
        params.set("lng", location.lng.toString());
      }

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
  }, [city, location]);

  const handleAiSearch = async (query) => {
    setAiLoading(true);
    setError(null);
    setAiMessage(null);
    setActiveQuery(query);

    try {
      const body = { city, query };
      if (location) {
        body.lat = location.lat;
        body.lng = location.lng;
      }

      const res = await fetch("/api/cafes/ai-filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("AI filter gagal");

      const data = await res.json();
      setCafes(data.cafes || []);
      setAiMessage(data.aiMessage || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

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
        setTimeout(fetchAllCafes, 5000);
      }
    } catch {
      // Ignore
    }
  };

  const resetToAll = () => {
    setActiveQuery(null);
    setAiMessage(null);
    fetchAllCafes();
  };

  useEffect(() => {
    if (!activeQuery) {
      fetchAllCafes();
    }
  }, [fetchAllCafes, activeQuery]);

  useEffect(() => {
    if (!scrapingInProgress) return;
    const interval = setInterval(fetchAllCafes, 10000);
    return () => clearInterval(interval);
  }, [scrapingInProgress, fetchAllCafes]);

  const isLoading = loading || aiLoading;

  return (
    <div className="min-h-screen">
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

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
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

        {locationError && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm text-center">
            {locationError}
          </div>
        )}

        <AiSearchBar
          onSearch={handleAiSearch}
          loading={aiLoading}
          aiMessage={aiMessage}
        />

        {activeQuery && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Hasil AI untuk: <span className="font-medium text-foreground">&ldquo;{activeQuery}&rdquo;</span>
              {" "}&middot; {cafes.length} cafe
            </p>
            <Button variant="ghost" size="sm" onClick={resetToAll}>
              Tampilkan semua
            </Button>
          </div>
        )}

        {!activeQuery && !isLoading && cafes.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {cafes.length} cafe ditemukan &middot; urutkan berdasarkan {location ? "jarak terdekat" : "keunikan"}
          </p>
        )}

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <EmptyState message="Gagal memuat data cafe" onReset={resetToAll} />
        ) : cafes.length === 0 ? (
          <EmptyState
            message={
              activeQuery
                ? "AI tidak menemukan cafe yang cocok dengan request kamu"
                : "Belum ada data cafe. Coba refresh data dulu."
            }
            onReset={resetToAll}
          />
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
