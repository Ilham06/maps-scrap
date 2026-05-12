"use client";

import { useState, useCallback } from "react";

export default function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung oleh browser kamu");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        const messages = {
          1: "Akses lokasi ditolak. Izinkan di pengaturan browser.",
          2: "Lokasi tidak tersedia.",
          3: "Permintaan lokasi timeout.",
        };
        setError(messages[err.code] || "Gagal mendapatkan lokasi");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { location, loading, error, requestLocation };
}
