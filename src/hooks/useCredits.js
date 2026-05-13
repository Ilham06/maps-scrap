"use client";

import { useState, useEffect, useCallback } from "react";

export default function useCredits() {
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then(({ credits }) => setCredits(credits))
      .catch(() => setCredits(5));
  }, []);

  const consume = useCallback(async () => {
    const res = await fetch("/api/credits", { method: "POST" });
    const { success, remaining } = await res.json();
    setCredits(remaining);
    return success;
  }, []);

  return {
    credits: credits ?? 5,
    isLoaded: credits !== null,
    hasCredits: credits === null || credits > 0,
    consume,
  };
}
