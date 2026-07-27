const ID_PATTERN = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

export function extractVideoId(url) {
  const match = (url || '').match(ID_PATTERN)
  return match ? match[1] : null
}

export function thumbnailUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

/** Fetch title/channel for a video using YouTube's public oEmbed endpoint. No API key required. */
export async function fetchVideoMeta(url) {
  const videoId = extractVideoId(url)
  if (!videoId) {
    throw new Error("That doesn't look like a YouTube link. Paste a full youtube.com or youtu.be URL.")
  }
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  const res = await fetch(oembedUrl)
  if (!res.ok) {
    throw new Error('Could not find that video — it may be private or removed.')
  }
  const data = await res.json()
  return {
    videoId,
    title: data.title,
    channel: data.author_name,
    thumbnail: thumbnailUrl(videoId),
  }
}
