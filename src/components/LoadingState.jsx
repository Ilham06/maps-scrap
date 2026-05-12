export default function LoadingState({ count = 6 }) {
  const messages = [
    "ngecek tempat-tempat...",
    "nyari yang vibe-nya pas...",
    "bentar ya, lagi explore...",
  ];
  const message = messages[Math.floor(Date.now() / 3000) % messages.length];

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground animate-pulse">
        {message}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-card border border-border p-4 space-y-2.5 animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex justify-between">
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-muted rounded-md w-3/4" />
                <div className="h-2.5 bg-muted rounded-md w-1/2" />
              </div>
              <div className="h-10 w-10 bg-warm rounded-lg shrink-0" />
            </div>
            <div className="flex gap-1">
              <div className="h-4 bg-muted rounded-md w-10" />
              <div className="h-4 bg-muted rounded-md w-12" />
            </div>
            <div className="h-12 bg-muted/60 rounded-lg w-full" />
            <div className="h-2.5 bg-muted rounded-md w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
