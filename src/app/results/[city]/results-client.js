"use client";

import { useState, useEffect, useCallback } from "react";
import { Coffee, MapPin, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import AiSearchBar from "@/components/AiSearchBar";
import CafeCard from "@/components/CafeCard";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import useGeolocation from "@/hooks/useGeolocation";
import useCredits from "@/hooks/useCredits";

export default function ResultsClient({ city, cityData }) {
  const { credits, isLoaded: creditsLoaded } = useCredits();
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

  // Trigger scrape sekali saat landing — server handle cooldown & lock
  useEffect(() => {
    fetch("/api/scraper/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.status === "started") setScrapingInProgress(true); })
      .catch(() => {});
  }, [city]);

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

  // Poll tiap 10s selama scraping berjalan
  useEffect(() => {
    if (!scrapingInProgress) return;
    const interval = setInterval(fetchAllCafes, 10000);
    return () => clearInterval(interval);
  }, [scrapingInProgress, fetchAllCafes]);

  const showSkeleton = (loading || (scrapingInProgress && !lastUpdated)) && cafes.length === 0;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg font-bold hover:opacity-80">
              <Coffee className="h-4 w-4 inline-flex mr-1.5" />WFC Cafe Finder
            </Link>
            <div className="flex items-center gap-3">
              {creditsLoaded && (
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < credits ? "bg-primary" : "bg-muted-foreground/25"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{credits}</span>
                </div>
              )}
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Update: {new Date(lastUpdated).toLocaleDateString("id-ID")}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">
          <MapPin className="h-5 w-5 inline-flex mr-1.5 text-primary" />Cafe di {cityData.label}
        </h1>

        {scrapingInProgress && cafes.length > 0 && (
          <div className="flex items-center justify-center gap-2 bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            Scraping cafe baru di {cityData.label}... akan update otomatis
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

        {!activeQuery && !loading && cafes.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {cafes.length} cafe ditemukan &middot; urutkan berdasarkan {location ? "jarak terdekat" : "keunikan"}
          </p>
        )}

        {showSkeleton ? (
          <LoadingState
            message={
              scrapingInProgress
                ? `Scraping Google Maps untuk ${cityData.label}...`
                : null
            }
          />
        ) : error ? (
          <EmptyState message="Gagal memuat data cafe" onReset={resetToAll} />
        ) : cafes.length === 0 ? (
          <EmptyState
            message={
              activeQuery
                ? "AI tidak menemukan cafe yang cocok dengan request kamu"
                : `Belum ada cafe ditemukan di ${cityData.label}.`
            }
            onReset={resetToAll}
          />
        ) : (
          <div className="relative">
            {aiLoading && (
              <div className="absolute inset-0 z-10 flex items-start justify-center pt-10 pointer-events-none">
                <div className="flex items-center gap-2 bg-background border shadow-md rounded-full px-4 py-2 text-sm font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                  Memfilter dengan AI...
                </div>
              </div>
            )}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity ${aiLoading ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
              {cafes.map((cafe) => (
                <CafeCard key={cafe.id} cafe={cafe} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
