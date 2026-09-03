const BASE = 'https://api.microlink.io'

/** Fetch title/description/image/site name for any URL. No API key required at light usage. */
export async function fetchArticleMeta(url) {
  const endpoint = `${BASE}/?url=${encodeURIComponent(url)}`
  const res = await fetch(endpoint)
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Link preview is rate-limited right now — try again shortly.')
    }
    throw new Error(`Could not read that link (${res.status}).`)
  }
  const json = await res.json()
  if (json.status !== 'success') {
    throw new Error("Couldn't find a preview for that link.")
  }
  const data = json.data || {}
  return {
    title: data.title || url,
    description: data.description || null,
    image: data.image?.url || null,
    publisher: data.publisher || null,
  }
}
