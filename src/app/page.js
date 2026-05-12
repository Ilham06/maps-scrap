"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Coffee, MapPin, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import useGeolocation from "@/hooks/useGeolocation";
import useCredits from "@/hooks/useCredits";

export default function Home() {
  const router = useRouter();
  const { location, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();
  const { credits, isLoaded, hasCredits, consume } = useCredits();

  const [city, setCity] = useState(null); // { name, slug }
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState(null);

  useEffect(() => {
    if (!location || city) return;
    setGeocoding(true);
    setGeocodeError(null);
    fetch(`/api/geocode?lat=${location.lat}&lng=${location.lng}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.city) setCity({ name: data.city, slug: data.slug });
        else setGeocodeError("Gagal mendeteksi kota dari lokasimu");
      })
      .catch(() => setGeocodeError("Gagal mendeteksi kota dari lokasimu"))
      .finally(() => setGeocoding(false));
  }, [location, city]);

  function handleFindCafe() {
    if (!city || !hasCredits) return;
    consume();
    router.push(`/results/${city.slug}`);
  }

  const isLoading = geoLoading || geocoding;
  const error = geoError || geocodeError;

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
            <Coffee className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">WFC Cafe Finder</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Temukan cafe unik untuk kerja di kotamu
          </p>
        </div>

        {/* Credits */}
        {isLoaded && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < credits ? "bg-primary" : "bg-muted-foreground/25"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {credits} kredit tersisa
            </p>
          </div>
        )}

        {/* Main action area */}
        <div className="space-y-4">
          {!city && !isLoading && !error && (
            <Button
              size="lg"
              className="w-full rounded-xl"
              onClick={requestLocation}
              disabled={!hasCredits}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {hasCredits ? "Izinkan Lokasi" : "Kredit habis"}
            </Button>
          )}

          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {geoLoading ? "Mencari lokasi kamu..." : "Mendeteksi kota..."}
              </p>
            </div>
          )}

          {error && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-sm text-left">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-xl"
                onClick={() => { setGeocodeError(null); setCity(null); requestLocation(); }}
              >
                Coba Lagi
              </Button>
            </div>
          )}

          {city && !isLoading && !error && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-0.5">Lokasi terdeteksi</p>
                <div className="flex items-center justify-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{city.name}</span>
                </div>
              </div>

              {hasCredits ? (
                <Button
                  size="lg"
                  className="w-full rounded-xl"
                  onClick={handleFindCafe}
                >
                  Temukan Cafe di {city.name}
                </Button>
              ) : (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  Kredit kamu sudah habis.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
