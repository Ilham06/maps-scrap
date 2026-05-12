"use client";

import { useRouter } from "next/navigation";
import { SUPPORTED_CITIES } from "@/lib/constants";

export default function CitySelector({ activeCity }) {
  const router = useRouter();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {SUPPORTED_CITIES.map((city) => {
        const isActive = activeCity === city.id;
        return (
          <button
            key={city.id}
            onClick={() => router.push(`/results/${city.id}`)}
            className={`
              shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm
              transition-all duration-150 cursor-pointer
              ${isActive
                ? "bg-foreground text-background font-medium shadow-sm"
                : "bg-card border border-border hover:border-foreground/20 hover:shadow-sm text-foreground/80"
              }
            `}
          >
            <span className="text-base leading-none">{city.emoji}</span>
            <span>{city.label}</span>
          </button>
        );
      })}
    </div>
  );
}
