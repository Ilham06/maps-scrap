import { EXCLUDED_CHAINS, UNIQUE_WORDS } from "./constants";

export function isMainstreamChain(name) {
  const lower = name.toLowerCase();
  return EXCLUDED_CHAINS.some((chain) => lower.includes(chain));
}

export function meetsMinimumQuality(cafe) {
  if (cafe.rating !== null && cafe.rating < 3.5) return false;
  if (cafe.reviewCount !== null && cafe.reviewCount < 5) return false;
  return true;
}

export function calculateUniquenessScore(name) {
  let score = 0;

  if (name.length <= 15) score += 10;
  if (name.length <= 8) score += 10;

  if (/\d/.test(name)) score += 5;

  if (/[&.,']/.test(name)) score += 5;

  const lower = name.toLowerCase();
  for (const word of UNIQUE_WORDS) {
    if (lower.includes(word)) {
      score += 15;
      break;
    }
  }

  const baseScore = Math.min(score, 45);
  const normalizedScore = Math.round((baseScore / 45) * 100);

  return Math.min(normalizedScore, 100);
}

export function filterAndScoreCafes(cafes) {
  return cafes
    .filter((cafe) => !isMainstreamChain(cafe.name))
    .filter(meetsMinimumQuality)
    .map((cafe) => ({
      ...cafe,
      uniquenessScore: calculateUniquenessScore(cafe.name),
    }));
}

export function deduplicateCafes(cafes) {
  const seen = new Map();
  for (const cafe of cafes) {
    const key = cafe.name.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.set(key, cafe);
    }
  }
  return Array.from(seen.values());
}

export function filterByMood(cafes, mood) {
  if (!mood) return cafes;
  return cafes.filter((cafe) => {
    if (!cafe.moodTags) return false;
    try {
      const tags = JSON.parse(cafe.moodTags);
      return tags.includes(mood);
    } catch {
      return false;
    }
  });
}

export function sortCafes(cafes, sortBy = "unique") {
  const sorted = [...cafes];
  switch (sortBy) {
    case "rating":
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "wfc":
      return sorted.sort((a, b) => (b.wfcScore || 0) - (a.wfcScore || 0));
    case "unique":
    default:
      return sorted.sort(
        (a, b) => (b.uniquenessScore || 0) - (a.uniquenessScore || 0)
      );
  }
}
