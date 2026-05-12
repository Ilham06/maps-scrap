"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUPPORTED_CITIES, cityToSlug } from "@/lib/constants";

export default function CitySelector({ activeCity }) {
  const router = useRouter();
  const [customCity, setCustomCity] = useState("");

  function handleCustomSubmit(e) {
    e.preventDefault();
    const slug = cityToSlug(customCity);
    if (!slug) return;
    setCustomCity("");
    router.push(`/results/${slug}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {SUPPORTED_CITIES.map((city) => (
        <Button
          key={city.id}
          variant={activeCity === city.id ? "default" : "outline"}
          size="sm"
          className="shrink-0 rounded-full px-4"
          onClick={() => router.push(`/results/${city.id}`)}
        >
          {city.label}
        </Button>
      ))}

      <form onSubmit={handleCustomSubmit} className="flex items-center gap-1 shrink-0">
        <input
          type="text"
          value={customCity}
          onChange={(e) => setCustomCity(e.target.value)}
          placeholder="Kota lain..."
          className="h-8 w-28 rounded-full border border-input bg-background px-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={!customCity.trim()}
          className="rounded-full h-8 w-8 p-0 shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
