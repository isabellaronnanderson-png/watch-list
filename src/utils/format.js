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

export const MEDIA_TYPES = [
  { id: 'movie', label: 'Films' },
  { id: 'tv', label: 'TV Shows' },
]

export function yearFromDate(dateStr) {
  if (!dateStr) return null
  return dateStr.slice(0, 4)
}
