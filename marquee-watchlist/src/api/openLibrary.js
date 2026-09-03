const BASE = 'https://openlibrary.org'
const COVERS_BASE = 'https://covers.openlibrary.org/b/id'

/** Search books by title/author. No API key required. */
export async function searchBooks(query) {
  if (!query || !query.trim()) return []
  const url = new URL(BASE + '/search.json')
  url.searchParams.set('q', query)
  url.searchParams.set(
    'fields',
    'key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject'
  )
  url.searchParams.set('limit', '8')
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Open Library search failed (${res.status})`)
  const data = await res.json()
  return data.docs || []
}

export function coverUrl(coverId, size = 'M') {
  if (!coverId) return null
  return `${COVERS_BASE}/${coverId}-${size}.jpg`
}
