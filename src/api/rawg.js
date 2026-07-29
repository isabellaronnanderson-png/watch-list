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
  const res = await fetch(url.toString())
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
