"use client";

export default function CafeCard({ cafe }) {
  const moodTags = Array.isArray(cafe.moodTags) ? cafe.moodTags : [];

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    cafe.name + " " + cafe.city
  )}`;

  function formatDistance(km) {
    if (km == null) return null;
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km} km`;
  }

  const distance = formatDistance(cafe.distanceKm);

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl bg-card border border-border p-4 transition-all duration-200 hover:shadow-md hover:border-foreground/15 hover:-translate-y-0.5"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[15px] leading-snug truncate group-hover:text-primary transition-colors">
            {cafe.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
            {cafe.rating && <span>{cafe.rating.toFixed(1)} \u2605</span>}
            {cafe.reviewCount && <span>\u00b7 {cafe.reviewCount}</span>}
            {distance && <span className="text-primary font-medium">\u00b7 {distance}</span>}
          </div>
        </div>
        {cafe.wfcScore != null && (
          <div className="shrink-0 h-10 w-10 rounded-lg bg-warm flex flex-col items-center justify-center">
            <span className="text-sm font-bold leading-none text-primary">{cafe.wfcScore}</span>
            <span className="text-[8px] text-muted-foreground font-medium">wfc</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {(moodTags.length > 0 || cafe.uniquenessScore >= 70) && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {moodTags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px]">
              {tag}
            </span>
          ))}
          {cafe.uniquenessScore >= 70 && (
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold">
              unik pick
            </span>
          )}
        </div>
      )}

      {/* AI reason */}
      {cafe.aiReason && (
        <p className="text-[13px] leading-relaxed mb-2.5 bg-warm rounded-lg px-3 py-2 text-warm-foreground">
          {cafe.aiReason}
        </p>
      )}

      {/* Vibe */}
      {cafe.vibeDescription && !cafe.aiReason && (
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-2.5 bg-muted/50 rounded-lg px-3 py-2 italic">
          &ldquo;{cafe.vibeDescription}&rdquo;
        </p>
      )}

      {/* Highlight */}
      {cafe.highlightFeature && (
        <p className="text-[11px] text-muted-foreground mb-1.5">
          \u2192 {cafe.highlightFeature}
        </p>
      )}

      {/* Warning */}
      {cafe.warningFlag && (
        <p className="text-[11px] text-destructive/80 mb-1.5">
          heads up: {cafe.warningFlag}
        </p>
      )}

      {/* Address */}
      {cafe.address && (
        <p className="text-[10px] text-muted-foreground/50 truncate mt-2 pt-2 border-t border-border/50" title={cafe.address}>
          {cafe.address}
        </p>
      )}
    </a>
  );
}
