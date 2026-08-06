const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const REGION = import.meta.env.VITE_TMDB_REGION || 'US'
const BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p'

function assertKey() {
  if (!API_KEY) {
    throw new Error(
      'Missing VITE_TMDB_API_KEY. Copy .env.example to .env and add your TMDB API key.'
    )
  }
}

async function get(path, params = {}) {
  assertKey()
  const url = new URL(BASE + path)
  url.searchParams.set('api_key', API_KEY)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v)
  })
  const res = await fetch(url.toString())
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.status_message || `TMDB request failed (${res.status})`)
  }
  return res.json()
}

/** Search movies + TV shows by text query. Filters out people. */
export async function searchTitles(query) {
  if (!query || !query.trim()) return []
  const data = await get('/search/multi', { query, include_adult: false })
  return (data.results || []).filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
}

/**
 * Search by director name: finds the best-matching person, then pulls anything
 * they directed from their combined credits. Results are shaped like the regular
 * multi-search results so they can be merged into the same list.
 */
export async function searchByDirector(query) {
  if (!query || !query.trim()) return []
  const people = await get('/search/person', { query })
  const person = people.results?.[0]
  if (!person) return []
  const credits = await get(`/person/${person.id}/combined_credits`)
  const directed = (credits.crew || []).filter((c) => c.job === 'Director')
  return directed
    .filter((c) => c.media_type === 'movie' || c.media_type === 'tv')
    .map((c) => ({
      id: c.id,
      media_type: c.media_type,
      title: c.title,
      name: c.name,
      poster_path: c.poster_path,
      release_date: c.release_date,
      first_air_date: c.first_air_date,
      genre_ids: c.genre_ids,
    }))
}

/** Fetch and merge movie + tv genre lists, keyed by media type. */
export async function getGenreMaps() {
  const [movieGenres, tvGenres] = await Promise.all([
    get('/genre/movie/list'),
    get('/genre/tv/list'),
  ])
  const toMap = (list) => Object.fromEntries(list.map((g) => [g.id, g.name]))
  return {
    movie: toMap(movieGenres.genres || []),
    tv: toMap(tvGenres.genres || []),
  }
}

/** Fetch runtime + full genre details for a single title. */
export async function getDetails(mediaType, tmdbId) {
  const path = mediaType === 'tv' ? `/tv/${tmdbId}` : `/movie/${tmdbId}`
  const data = await get(path)
  const runtimeMinutes =
    mediaType === 'tv'
      ? (data.episode_run_time && data.episode_run_time[0]) || null
      : data.runtime || null
  return {
    runtimeMinutes,
    genres: (data.genres || []).map((g) => g.name),
    overview: data.overview,
    numberOfSeasons: mediaType === 'tv' ? data.number_of_seasons : null,
  }
}

/** Fetch streaming availability for the configured region. */
export async function getWatchProviders(mediaType, tmdbId) {
  const path = mediaType === 'tv' ? `/tv/${tmdbId}/watch/providers` : `/movie/${tmdbId}/watch/providers`
  const data = await get(path)
  const regionData = data.results?.[REGION]
  if (!regionData) return []

  const seen = new Map()
  ;['flatrate', 'ads', 'free'].forEach((bucket) => {
    ;(regionData[bucket] || []).forEach((p) => {
      if (!seen.has(p.provider_id)) {
        seen.set(p.provider_id, {
          id: p.provider_id,
          name: p.provider_name,
          logoPath: p.logo_path,
          kind: 'stream',
        })
      }
    })
  })
  ;['rent', 'buy'].forEach((bucket) => {
    ;(regionData[bucket] || []).forEach((p) => {
      if (!seen.has(p.provider_id)) {
        seen.set(p.provider_id, {
          id: p.provider_id,
          name: p.provider_name,
          logoPath: p.logo_path,
          kind: bucket,
        })
      }
    })
  })
  return Array.from(seen.values())
}

export function posterUrl(path, size = 'w342') {
  if (!path) return null
  return `${IMG_BASE}/${size}${path}`
}

export function providerLogoUrl(path, size = 'w45') {
  if (!path) return null
  return `${IMG_BASE}/${size}${path}`
}

export { REGION }
