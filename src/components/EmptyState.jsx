"use client";

export default function EmptyState({ onReset, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-2xl">
      <p className="text-3xl mb-3 opacity-40">~</p>
      <h3 className="text-sm font-medium mb-1">
        {message || "ga nemu yang cocok, nih"}
      </h3>
      <p className="text-xs text-muted-foreground mb-4 max-w-xs leading-relaxed">
        coba kata kunci lain, atau reset biar tampil semua
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="text-xs font-semibold text-primary hover:underline underline-offset-4 cursor-pointer"
        >
          tampilkan semua &rarr;
        </button>
      )}
    </div>
  );
}
