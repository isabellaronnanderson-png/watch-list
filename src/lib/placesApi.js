// Talks to our own /api/places serverless function, which holds the real
// Google Places API key server-side. Never call Google directly from the
// browser — see api/places.js.

export async function searchPlaces(query, city) {
  if (!query || query.trim().length < 2) return [];
  const params = new URLSearchParams({ q: query, city: city || '' });
  const res = await fetch(`/api/places?${params.toString()}`);
  if (!res.ok) {
    if (res.status === 501) return []; // API key not configured yet
    throw new Error('Place search failed');
  }
  const data = await res.json();
  return data.results || [];
}
