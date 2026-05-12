"use client";

import { Button } from "@/components/ui/button";

export default function EmptyState({ onReset, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">&#9749;</div>
      <h3 className="text-lg font-semibold mb-2">
        {message || "Tidak ada cafe dengan filter ini"}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Coba ubah filter mood atau sort untuk menemukan cafe yang cocok
      </p>
      {onReset && (
        <Button variant="outline" onClick={onReset}>
          Reset Filter
        </Button>
      )}
    </div>
  );
}
