const EARTH_RADIUS_KM = 6371;

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Haversine formula — returns distance in km between two lat/lng points.
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Adds `distanceKm` field to each cafe that has coordinates.
 * Cafes without coordinates get `distanceKm: null`.
 */
export function addDistanceToCafes(cafes, userLat, userLng) {
  return cafes.map((cafe) => {
    if (cafe.latitude == null || cafe.longitude == null) {
      return { ...cafe, distanceKm: null };
    }
    const dist = haversineDistance(userLat, userLng, cafe.latitude, cafe.longitude);
    return { ...cafe, distanceKm: Math.round(dist * 10) / 10 };
  });
}

export function sortByDistance(cafes) {
  return [...cafes].sort((a, b) => {
    if (a.distanceKm == null && b.distanceKm == null) return 0;
    if (a.distanceKm == null) return 1;
    if (b.distanceKm == null) return -1;
    return a.distanceKm - b.distanceKm;
  });
}
