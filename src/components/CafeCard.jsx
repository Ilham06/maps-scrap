"use client";

import Image from "next/image";
import { Star, MapPin, Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function CafeCard({ cafe }) {
  const moodTags = Array.isArray(cafe.moodTags)
    ? cafe.moodTags
    : [];

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    cafe.name + " " + cafe.city
  )}`;

  return (
    <Card className="flex flex-col h-full transition-shadow hover:shadow-lg overflow-hidden">
      {cafe.photoUrl && (
        <div className="relative w-full h-44 shrink-0">
          <Image
            src={cafe.photoUrl}
            alt={cafe.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold leading-tight">{cafe.name}</h3>
          {cafe.uniquenessScore >= 70 && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              Unik Pick
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {moodTags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-3">
        {cafe.wfcScore != null && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">WFC Score</span>
              <span className="text-muted-foreground">{cafe.wfcScore}/100</span>
            </div>
            <Progress value={cafe.wfcScore} className="h-2" />
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          {cafe.rating && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              {cafe.rating.toFixed(1)}
            </span>
          )}
          {cafe.reviewCount && (
            <span>({cafe.reviewCount} review)</span>
          )}
          {cafe.distanceKm != null && (
            <span className="flex items-center gap-1 text-primary font-medium">
              <MapPin className="h-3.5 w-3.5" /> {cafe.distanceKm < 1
                ? `${Math.round(cafe.distanceKm * 1000)}m`
                : `${cafe.distanceKm} km`}
            </span>
          )}
        </div>

        {cafe.aiReason && (
          <p className="text-sm bg-primary/5 border border-primary/20 rounded-md px-2.5 py-1.5 leading-relaxed">
            <Sparkles className="h-3.5 w-3.5 inline-flex text-primary mr-1 shrink-0" />
            {cafe.aiReason}
          </p>
        )}

        {cafe.vibeDescription && (
          <p className="text-sm italic text-muted-foreground leading-relaxed">
            &ldquo;{cafe.vibeDescription}&rdquo;
          </p>
        )}

        {cafe.highlightFeature && (
          <p className="text-sm">
            <span className="font-medium">Highlight:</span>{" "}
            {cafe.highlightFeature}
          </p>
        )}

        {cafe.warningFlag && (
          <Badge variant="destructive" className="text-xs">
            {cafe.warningFlag}
          </Badge>
        )}

        {cafe.address && (
          <p className="text-xs text-muted-foreground truncate" title={cafe.address}>
            {cafe.address}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            Buka di Google Maps
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
