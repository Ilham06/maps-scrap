"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import CitySelector from "@/components/CitySelector";
import AiSearchBar from "@/components/AiSearchBar";
import CafeCard from "@/components/CafeCard";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
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

      if (!res.ok) throw new Error("gagal nyari, coba lagi");

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
    <div className="min-h-screen flex flex-col bg-secondary/30">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold hover:text-primary transition-colors">
            wfc cafe finder
          </Link>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {lastUpdated && (
              <span>
                {new Date(lastUpdated).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
            <button
              onClick={triggerScrape}
              disabled={scrapingInProgress}
              className="hover:text-foreground disabled:opacity-40 transition-colors cursor-pointer"
            >
              {scrapingInProgress ? "updating..." : "refresh"}
            </button>
          </div>
        </div>
      </header>

      {/* City bar */}
      <div className="bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5">
          <CitySelector activeCity={city} />
        </div>
      </div>

      {/* Search section */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-5 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold">
            cafe di {cityData.label} {cityData.emoji}
          </h1>
          {scrapingInProgress && (
            <span className="text-[11px] text-muted-foreground animate-pulse">
              nyari cafe baru...
            </span>
          )}
        </div>

        {locationError && (
          <p className="text-[11px] text-destructive/70 mb-2">{locationError}</p>
        )}

        <AiSearchBar
          onSearch={handleAiSearch}
          loading={aiLoading}
          aiMessage={aiMessage}
        />
      </div>

      {/* Results */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-4">
        {/* Status bar */}
        {activeQuery && !isLoading && (
          <div className="flex items-center justify-between mb-3 bg-card border border-border rounded-lg px-3 py-2">
            <p className="text-[11px] text-muted-foreground">
              &ldquo;{activeQuery}&rdquo; &middot; {cafes.length} hasil
            </p>
            <button
              onClick={resetToAll}
              className="text-[11px] text-primary font-medium hover:underline underline-offset-4 cursor-pointer"
            >
              semua cafe
            </button>
          </div>
        )}

        {!activeQuery && !isLoading && cafes.length > 0 && (
          <p className="text-[11px] text-muted-foreground mb-3">
            {cafes.length} cafe {location ? "\u00b7 dari terdekat" : ""}
          </p>
        )}

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <EmptyState message={error} onReset={resetToAll} />
        ) : cafes.length === 0 ? (
          <EmptyState
            message={
              activeQuery
                ? "ga nemu yang cocok buat request kamu"
                : "belum ada data cafe. coba refresh dulu."
            }
            onReset={activeQuery ? resetToAll : triggerScrape}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cafes.map((cafe) => (
              <CafeCard key={cafe.id} cafe={cafe} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-foreground text-background px-4 sm:px-6 py-3 mt-auto">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[11px] opacity-60">
          <span>data dari google maps &middot; bukan rekomendasi resmi</span>
          <Link href="/" className="hover:opacity-100 transition-opacity">
            home
          </Link>
        </div>
      </footer>
    </div>
  );
}
