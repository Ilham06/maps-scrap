"use client";

import { useState } from "react";

const SUGGESTIONS = [
  { text: "sepi buat fokus", icon: "\u{1F3A7}" },
  { text: "aesthetic buat konten", icon: "\u{1F4F8}" },
  { text: "cozy, ada colokan", icon: "\u{1F50C}" },
  { text: "nongkrong rame-rame", icon: "\u{1F37B}" },
  { text: "hidden gem", icon: "\u{1F48E}" },
  { text: "yang paling deket", icon: "\u{1F4CD}" },
  { text: "buat nulis / thesis", icon: "\u{270F}\u{FE0F}" },
  { text: "vibes industrial", icon: "\u{1F3ED}" },
];

export default function AiSearchBar({ onSearch, loading, aiMessage }) {
  const [query, setQuery] = useState("");

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
    <div className="bg-warm rounded-2xl p-4 space-y-3">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="mau cafe kayak gimana? ketik aja..."
            disabled={loading}
            className="w-full h-11 rounded-xl bg-background border border-border/80 pl-4 pr-20 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 rounded-lg bg-foreground text-background text-xs font-semibold disabled:opacity-30 hover:opacity-90 transition-opacity cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                hmm...
              </span>
            ) : (
              "cari"
            )}
          </button>
        </div>
      </form>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            onClick={() => handleSuggestion(s.text)}
            disabled={loading}
            className="shrink-0 flex items-center gap-1 rounded-lg bg-background/70 px-2.5 py-1.5 text-[11px] text-warm-foreground hover:bg-background transition-colors disabled:opacity-40 cursor-pointer"
          >
            <span>{s.icon}</span>
            <span>{s.text}</span>
          </button>
        ))}
      </div>

      {aiMessage && (
        <div className="bg-background/70 rounded-xl px-3.5 py-2.5 text-sm text-foreground leading-relaxed">
          {aiMessage}
        </div>
      )}
    </div>
  );
}
