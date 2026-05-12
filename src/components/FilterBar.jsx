"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MOOD_TAGS, SORT_OPTIONS } from "@/lib/constants";

export default function FilterBar({
  activeMood,
  activeSort,
  onMoodChange,
  onSortChange,
  totalCount,
  hasLocation,
  onRequestLocation,
  locationLoading,
}) {
  function handleSortClick(option) {
    if (option.requiresLocation && !hasLocation) {
      onRequestLocation?.();
      onSortChange(option.id);
      return;
    }
    onSortChange(option.id);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Button
          variant={!activeMood ? "default" : "outline"}
          size="sm"
          className="shrink-0 rounded-full"
          onClick={() => onMoodChange(null)}
        >
          Semua
        </Button>
        {MOOD_TAGS.map((mood) => (
          <Button
            key={mood}
            variant={activeMood === mood ? "default" : "outline"}
            size="sm"
            className="shrink-0 rounded-full"
            onClick={() => onMoodChange(activeMood === mood ? null : mood)}
          >
            {mood}
          </Button>
        ))}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {SORT_OPTIONS.map((option) => {
            const isDisabled = option.requiresLocation && locationLoading;
            return (
              <Button
                key={option.id}
                variant={activeSort === option.id ? "secondary" : "ghost"}
                size="sm"
                className="text-xs"
                disabled={isDisabled}
                onClick={() => handleSortClick(option)}
              >
                {option.requiresLocation && <MapPin className="h-3 w-3 mr-1 inline-flex" />}
                {option.label}
                {option.requiresLocation && locationLoading && "..."}
              </Button>
            );
          })}
        </div>
        <span className="text-sm text-muted-foreground">
          {totalCount} cafe ditemukan
        </span>
      </div>
    </div>
  );
}
