export function formatRuntime(minutes) {
  if (!minutes) return '— MIN'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} MIN`
  return `${h}H ${String(m).padStart(2, '0')}M`
}

export const RUNTIME_BUCKETS = [
  { id: 'micro', label: 'Under 30', test: (m) => m != null && m < 30 },
  { id: 'short', label: '30–90', test: (m) => m != null && m >= 30 && m < 90 },
  { id: 'standard', label: '90–120', test: (m) => m != null && m >= 90 && m <= 120 },
  { id: 'long', label: '120–150', test: (m) => m != null && m > 120 && m <= 150 },
  { id: 'epic', label: '150+', test: (m) => m != null && m > 150 },
]

export function formatPages(count) {
  if (!count) return '— PP'
  return `${count} PP`
}

export const WATCH_STATUSES = [
  { id: 'want', label: 'Want to watch' },
  { id: 'watching', label: 'Watching' },
  { id: 'watched', label: 'Watched' },
]

export const READ_STATUSES = [
  { id: 'want', label: 'Want to read' },
  { id: 'reading', label: 'Reading' },
  { id: 'read', label: 'Read' },
]

export const LISTEN_STATUSES = [
  { id: 'want', label: 'Want to listen' },
  { id: 'listening', label: 'Listening' },
  { id: 'listened', label: 'Listened' },
]

export const MEDIA_TYPES = [
  { id: 'movie', label: 'Films' },
  { id: 'tv', label: 'TV Shows' },
]

export function yearFromDate(dateStr) {
  if (!dateStr) return null
  return dateStr.slice(0, 4)
}

// Deterministic-looking 5-digit "ticket number" derived from an item's id, purely decorative.
export function ticketNumber(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return String(hash % 100000).padStart(5, '0')
}

export const GAME_STATUSES = [
  { id: 'want', label: 'Want to play' },
  { id: 'playing', label: 'Playing' },
  { id: 'played', label: 'Played' },
]

export const LENGTH_BUCKETS = [
  { id: 'short', label: 'Under 10h', test: (h) => h != null && h < 10 },
  { id: 'medium', label: '10–30h', test: (h) => h != null && h >= 10 && h < 30 },
  { id: 'long', label: '30–60h', test: (h) => h != null && h >= 30 && h < 60 },
  { id: 'epic', label: '60h+', test: (h) => h != null && h >= 60 },
]

export const GAME_MODES = [
  { id: 'singleplayer', label: 'Singleplayer' },
  { id: 'multiplayer', label: 'Multiplayer' },
]
