const BASE = 'https://www.googleapis.com/books/v1/volumes'
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY

/**
 * Search books via Google Books. Works without a key at a low, shared rate limit
 * (easy to hit a 429 "too many requests"). Adding a free API key raises that limit
 * substantially - see .env.example for where to get one.
 */
export async function searchBooks(query) {
  if (!query || !query.trim()) return []
  const url = new URL(BASE)
  url.searchParams.set('q', query)
  url.searchParams.set('maxResults', '8')
  url.searchParams.set('langRestrict', 'en')
  if (API_KEY) url.searchParams.set('key', API_KEY)
  const res = await fetch(url.toString())
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(
        API_KEY
          ? 'Book search is rate-limited right now — try again shortly.'
          : 'Book search is rate-limited. Add a free VITE_GOOGLE_BOOKS_API_KEY to .env to raise this limit.'
      )
    }
    throw new Error(`Book search failed (${res.status})`)
  }
  const data = await res.json()
  return (data.items || []).map(normalizeVolume)
}

function normalizeVolume(item) {
  const info = item.volumeInfo || {}
  const thumbnail = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null
  return {
    id: item.id,
    title: info.title,
    author: info.authors?.[0] || 'Unknown author',
    year: info.publishedDate ? info.publishedDate.slice(0, 4) : null,
    coverUrl: thumbnail ? thumbnail.replace('http://', 'https://') : null,
    pageCount: info.pageCount || null,
    genres: parseCategories(info.categories),
  }
}

// Google's categories look like "Juvenile Fiction / Animals / Cats" - split and flatten,
// dedupe, since a single string with slashes reads poorly as a genre tag.
function parseCategories(categories) {
  if (!categories || !categories.length) return []
  const parts = categories.flatMap((c) => c.split('/').map((p) => p.trim())).filter(Boolean)
  return Array.from(new Set(parts))
}
