"use client";

import { useState, useRef } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  "Cafe sepi buat fokus kerja",
  "Tempat aesthetic buat foto",
  "Yang cozy dan ada colokan",
  "Cafe rame buat nongkrong bareng",
  "Hidden gem yang belum mainstream",
  "Suasana industrial, kopi enak",
  "Yang terdekat dari sini",
  "Cafe buat deadline all-nighter",
];

export default function AiSearchBar({ onSearch, loading, aiMessage }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || loading) return;
    onSearch(trimmed);
  }

  function handleSuggestion(text) {
    setQuery(text);
    onSearch(text);
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mau cafe kayak gimana? Cerita aja..."
            disabled={loading}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>
        <Button type="submit" size="sm" disabled={loading || !query.trim()}>
          {loading ? "Mikir..." : "Cari"}
        </Button>
      </form>

      {aiMessage && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
          <Sparkles className="h-3.5 w-3.5 inline-flex text-primary mr-1 shrink-0" />
          {aiMessage}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleSuggestion(s)}
            disabled={loading}
            className="shrink-0 rounded-full border border-input bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
