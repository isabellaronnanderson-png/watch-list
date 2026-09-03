const API_KEY = import.meta.env.VITE_RAWG_API_KEY
const BASE = 'https://api.rawg.io/api'

function assertKey() {
  if (!API_KEY) {
    throw new Error(
      'Missing VITE_RAWG_API_KEY. Get a free key at rawg.io/apidocs, add it to .env, and restart the dev server.'
    )
  }
}

async function get(path, params = {}) {
  assertKey()
  const url = new URL(BASE + path)
  url.searchParams.set('key', API_KEY)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v)
  })

  let res
  try {
    res = await fetch(url.toString())
  } catch {
    // fetch() throws a bare "Failed to fetch" TypeError when the request never
    // gets a response at all - could be no internet, RAWG's service being down,
    // or (most commonly for a free-tier key) the request being blocked in a way
    // that strips CORS headers, which browsers report as a generic network
    // failure rather than the real status code.
    throw new Error(
      "Couldn't reach the game database. If this keeps happening, test your key directly by visiting " +
        `${BASE}/games?key=${API_KEY}&search=test in a browser tab - if that also fails, the key or RAWG's ` +
        'service is the issue, not this app.'
    )
  }
  if (!res.ok) throw new Error(`RAWG request failed (${res.status})`)
  return res.json()
}

/** Search games by title. */
export async function searchGames(query) {
  if (!query || !query.trim()) return []
  const data = await get('/games', { search: query, page_size: 8 })
  return data.results || []
}

/** Fetch full details (genres, platforms, playtime, single/multiplayer tags) for one game. */
export async function getGameDetails(id) {
  const data = await get(`/games/${id}`)
  const tags = (data.tags || []).map((t) => t.name.toLowerCase())
  const modes = []
  if (tags.some((t) => /single.?player/.test(t))) modes.push('singleplayer')
  if (tags.some((t) => /multiplayer|co-?op/.test(t))) modes.push('multiplayer')

  return {
    genres: (data.genres || []).map((g) => g.name),
    platforms: (data.platforms || []).map((p) => p.platform.name),
    playtimeHours: data.playtime || null,
    modes,
  }
}
