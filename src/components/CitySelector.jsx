"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SUPPORTED_CITIES } from "@/lib/constants";

export default function CitySelector({ activeCity }) {
  const router = useRouter();

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
          <span className="mr-1.5">{city.emoji}</span>
          {city.label}
        </Button>
      ))}
    </div>
  );
}
