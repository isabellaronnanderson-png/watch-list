const API_KEY = import.meta.env.VITE_LASTFM_API_KEY
const BASE = 'https://ws.audioscrobbler.com/2.0/'

function assertKey() {
  if (!API_KEY) {
    throw new Error(
      'Missing VITE_LASTFM_API_KEY. Get a free key at last.fm/api/account/create, add it to .env, and restart the dev server.'
    )
  }
}

async function get(params) {
  assertKey()
  const url = new URL(BASE)
  url.searchParams.set('api_key', API_KEY)
  url.searchParams.set('format', 'json')
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v)
  })
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Last.fm request failed (${res.status})`)
  const data = await res.json()
  if (data.error) throw new Error(data.message || 'Last.fm request failed')
  return data
}

function pickImage(images) {
  if (!images || !images.length) return null
  const preferred = ['extralarge', 'large', 'medium']
  for (const size of preferred) {
    const match = images.find((i) => i.size === size && i['#text'])
    if (match) return match['#text']
  }
  const any = images.find((i) => i['#text'])
  return any ? any['#text'] : null
}

/** Search albums by name. */
export async function searchAlbums(query) {
  if (!query || !query.trim()) return []
  const data = await get({ method: 'album.search', album: query, limit: 12 })
  const matches = data.results?.albummatches?.album || []
  return matches.map((a) => ({
    name: a.name,
    artist: a.artist,
    coverUrl: pickImage(a.image),
  }))
}

/** Fetch genre tags and track count for an album, used when adding. */
export async function getAlbumInfo(artist, album) {
  const data = await get({ method: 'album.getinfo', artist, album })
  const info = data.album || {}
  const tracks = info.tracks?.track
  const trackCount = Array.isArray(tracks) ? tracks.length : tracks ? 1 : null
  return {
    genres: (info.tags?.tag || []).map((t) => t.name).slice(0, 5),
    trackCount,
    coverUrl: pickImage(info.image),
  }
}
