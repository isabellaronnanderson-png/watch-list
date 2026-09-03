const BASE = 'https://www.googleapis.com/books/v1/volumes'
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithRetry(url, attempt = 0) {
  const res = await fetch(url)
  if (!res.ok) {
    // Transient server-side hiccups (500/502/503/504) are common on Google's free/keyless
    // tier - retry once after a short delay before giving up.
    if ([500, 502, 503, 504].includes(res.status) && attempt < 1) {
      await sleep(500)
      return fetchWithRetry(url, attempt + 1)
    }
    if (res.status === 429) {
      throw new Error(
        API_KEY
          ? 'Book search is rate-limited right now — try again shortly.'
          : 'Book search is rate-limited. Add a free VITE_GOOGLE_BOOKS_API_KEY to .env to raise this limit.'
      )
    }
    if ([500, 502, 503, 504].includes(res.status)) {
      throw new Error("Google's book search hiccupped — try the search again.")
    }
    throw new Error(`Book search failed (${res.status})`)
  }
  return res.json()
}

/**
 * Search books via Google Books. Returns results in Google's own relevance order,
 * with no language filtering or bias - any edition/language Google surfaces is fair game.
 * Filters out items with no ISBN (a decent proxy for academic papers/theses/other
 * non-trade-published clutter, which almost never carry one) and restricts to
 * printType=books to exclude magazines/journals.
 */
export async function searchBooks(query) {
  if (!query || !query.trim()) return []
  const url = new URL(BASE)
  url.searchParams.set('q', query)
  url.searchParams.set('maxResults', '40')
  url.searchParams.set('printType', 'books')
  if (API_KEY) url.searchParams.set('key', API_KEY)

  const data = await fetchWithRetry(url.toString())
  const items = (data.items || []).map(normalizeVolume).filter((b) => b.hasIsbn)

  return items
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
    language: info.language || null,
    hasIsbn: (info.industryIdentifiers || []).some(
      (id) => id.type === 'ISBN_10' || id.type === 'ISBN_13'
    ),
  }
}

// Google's categories look like "Juvenile Fiction / Animals / Cats" - split and flatten,
// dedupe, since a single string with slashes reads poorly as a genre tag.
function parseCategories(categories) {
  if (!categories || !categories.length) return []
  const parts = categories.flatMap((c) => c.split('/').map((p) => p.trim())).filter(Boolean)
  return Array.from(new Set(parts))
}
