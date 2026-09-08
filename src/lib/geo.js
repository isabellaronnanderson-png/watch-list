// Haversine distance between two lat/lng points, in kilometers.
export function distanceKm(a, b) {
  if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) {
    return null;
  }
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// Average pairwise distance across a set of places with known coordinates.
// Returns null if fewer than 2 places have coordinates (can't judge proximity).
export function averagePairwiseDistance(places) {
  const withCoords = places.filter((p) => p.lat != null && p.lng != null);
  if (withCoords.length < 2) return null;

  let total = 0;
  let pairs = 0;
  for (let i = 0; i < withCoords.length; i++) {
    for (let j = i + 1; j < withCoords.length; j++) {
      const d = distanceKm(withCoords[i], withCoords[j]);
      if (d != null) {
        total += d;
        pairs += 1;
      }
    }
  }
  return pairs > 0 ? total / pairs : null;
}
