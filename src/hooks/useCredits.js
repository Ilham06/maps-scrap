"use client";

import { useState, useEffect } from "react";

const CREDITS_KEY = "wfc_credits";
const INITIAL_CREDITS = 5;

export default function useCredits() {
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(CREDITS_KEY);
    if (stored === null) {
      localStorage.setItem(CREDITS_KEY, INITIAL_CREDITS.toString());
      setCredits(INITIAL_CREDITS);
    } else {
      setCredits(parseInt(stored, 10));
    }
  }, []);

  function consume() {
    const next = Math.max(0, (credits ?? 0) - 1);
    localStorage.setItem(CREDITS_KEY, next.toString());
    setCredits(next);
    return next;
  }

  return {
    credits: credits ?? INITIAL_CREDITS,
    isLoaded: credits !== null,
    hasCredits: credits === null || credits > 0,
    consume,
  };
}
