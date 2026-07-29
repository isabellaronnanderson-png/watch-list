const BASE = 'https://www.googleapis.com/books/v1/volumes'

/**
 * Search books via Google Books. No API key required for normal usage volumes
 * (Google allows unauthenticated requests at moderate volume); langRestrict
 * biases results toward English-language editions/titles.
 */
export async function searchBooks(query) {
  if (!query || !query.trim()) return []
  const url = new URL(BASE)
  url.searchParams.set('q', query)
  url.searchParams.set('maxResults', '8')
  url.searchParams.set('langRestrict', 'en')
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Book search failed (${res.status})`)
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
