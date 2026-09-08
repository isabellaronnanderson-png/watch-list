// Vercel serverless function: proxies place search to Google Places API (New)
// so the API key never reaches the browser.
//
// Setup: create a Google Cloud project, enable "Places API (New)", create an
// API key restricted to server IPs / no referrer restriction (since this is
// a server-to-server call), and set it as GOOGLE_PLACES_API_KEY in your
// Vercel project's environment variables.

// Without an explicit location bias, Google infers location from the
// requesting server's IP — and a Vercel function's IP is US-based, so
// searches silently skew American no matter what city is typed. This
// lookup lets us bias the search toward the actual city instead.
const CITY_COORDS = {
  london: [51.5074, -0.1278], manchester: [53.4808, -2.2426], edinburgh: [55.9533, -3.1883],
  bristol: [51.4545, -2.5879], glasgow: [55.8642, -4.2518],
  paris: [48.8566, 2.3522], barcelona: [41.3874, 2.1686], madrid: [40.4168, -3.7038],
  rome: [41.9028, 12.4964], milan: [45.4642, 9.19], florence: [43.7696, 11.2558],
  venice: [45.4408, 12.3155], naples: [40.8518, 14.2681], athens: [37.9838, 23.7275],
  amsterdam: [52.3676, 4.9041], berlin: [52.52, 13.405], munich: [48.1351, 11.582],
  lisbon: [38.7223, -9.1393], porto: [41.1579, -8.6291], dublin: [53.3498, -6.2603],
  vienna: [48.2082, 16.3738], brussels: [50.8503, 4.3517], copenhagen: [55.6761, 12.5683],
  prague: [50.0755, 14.4378], budapest: [47.4979, 19.0402],
  stockholm: [59.3293, 18.0686], gothenburg: [57.7089, 11.9746], malmö: [55.605, 13.0038],
  malmo: [55.605, 13.0038], oslo: [59.9139, 10.7522], helsinki: [60.1699, 24.9384],
  reykjavik: [64.1466, -21.9426], zurich: [47.3769, 8.5417], geneva: [46.2044, 6.1432],
  basel: [47.5596, 7.5886],
  'new york': [40.7128, -74.006], 'los angeles': [34.0522, -118.2437],
  'san francisco': [37.7749, -122.4194], chicago: [41.8781, -87.6298], miami: [25.7617, -80.1918],
  boston: [42.3601, -71.0589], seattle: [47.6062, -122.3321], austin: [30.2672, -97.7431],
  'las vegas': [36.1699, -115.1398], toronto: [43.6532, -79.3832], vancouver: [49.2827, -123.1207],
  montreal: [45.5019, -73.5674], 'mexico city': [19.4326, -99.1332],
  tokyo: [35.6762, 139.6503], osaka: [34.6937, 135.5023], kyoto: [35.0116, 135.7681],
  seoul: [37.5665, 126.978], 'hong kong': [22.3193, 114.1694], singapore: [1.3521, 103.8198],
  bangkok: [13.7563, 100.5018], sydney: [-33.8688, 151.2093], melbourne: [-37.8136, 144.9631],
  auckland: [-36.8485, 174.7633], shanghai: [31.2304, 121.4737], beijing: [39.9042, 116.4074],
  dubai: [25.2048, 55.2708], 'tel aviv': [32.0853, 34.7818], istanbul: [41.0082, 28.9784]
};

function locationBiasForCity(city) {
  if (!city) return null;
  const coords = CITY_COORDS[city.trim().toLowerCase()];
  if (!coords) return null;
  const [latitude, longitude] = coords;
  return {
    circle: {
      center: { latitude, longitude },
      radius: 40000 // 40km — covers a city and its immediate surroundings
    }
  };
}

export default async function handler(req, res) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    res.status(501).json({
      error: 'GOOGLE_PLACES_API_KEY is not configured on the server yet.',
      results: []
    });
    return;
  }

  const { q, city } = req.query;
  if (!q || q.trim().length < 2) {
    res.status(200).json({ results: [] });
    return;
  }

  const textQuery = city ? `${q} in ${city}` : q;
  const locationBias = locationBiasForCity(city);

  try {
    const requestBody = { textQuery, maxResultCount: 8 };
    if (locationBias) requestBody.locationBias = locationBias;

    const googleRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.location',
          'places.priceLevel',
          'places.primaryType',
          'places.regularOpeningHours'
        ].join(',')
      },
      body: JSON.stringify(requestBody)
    });

    if (!googleRes.ok) {
      const text = await googleRes.text();
      res.status(googleRes.status).json({ error: text, results: [] });
      return;
    }

    const data = await googleRes.json();
    const results = (data.places || []).map((place) => ({
      googlePlaceId: place.id,
      name: place.displayName?.text || '',
      address: place.formattedAddress || '',
      lat: place.location?.latitude ?? null,
      lng: place.location?.longitude ?? null,
      priceLevel: place.priceLevel || null,
      primaryType: place.primaryType || null,
      openingHours: place.regularOpeningHours
        ? {
            periods: place.regularOpeningHours.periods || [],
            weekdayDescriptions: place.regularOpeningHours.weekdayDescriptions || []
          }
        : null
    }));

    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ error: String(err), results: [] });
  }
}
