const EARTH_RADIUS_KM = 6371;

function toRad(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/** Haversine distance in kilometres between two WGS84 points. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function mapsSearchUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function mapsDirectionsUrl(
  destination: { lat: number; lng: number },
  origin?: { lat: number; lng: number } | null
): string {
  const dest = `${destination.lat},${destination.lng}`;
  if (!origin) return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${dest}`;
}
