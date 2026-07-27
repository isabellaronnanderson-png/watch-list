// A fixed, curated list of providers to show as filter chips and ticket stamps,
// regardless of whether anything in the watchlist currently uses them.
// TMDB returns many near-duplicate provider names (e.g. "Netflix" vs
// "Netflix Standard with Ads") — `match` collapses those into one canonical id.
export const CANONICAL_PROVIDERS = [
  { id: 'netflix', label: 'Netflix', match: (n) => /netflix/i.test(n) },
  { id: 'disney', label: 'Disney+', match: (n) => /disney/i.test(n) },
  { id: 'hbomax', label: 'HBO Max', match: (n) => /\b(hbo|max)\b/i.test(n) },
  { id: 'appletv', label: 'Apple TV', match: (n) => /apple/i.test(n) },
  { id: 'crunchyroll', label: 'Crunchyroll', match: (n) => /crunchyroll/i.test(n) },
  { id: 'iplayer', label: 'BBC iPlayer', match: (n) => /bbc/i.test(n) },
  { id: 'now', label: 'NOW', match: (n) => /^now\b/i.test(n.trim()) },
  { id: 'itvx', label: 'ITVX', match: (n) => /itv/i.test(n) },
  { id: 'mubi', label: 'Mubi', match: (n) => /mubi/i.test(n) },
  { id: 'channel4', label: 'Channel 4', match: (n) => /channel ?4|all ?4/i.test(n) },
]

// Catch-all for anything TMDB lists as rent/buy only, or a stream provider
// that didn't match one of the named services above.
export const RENT_PROVIDER = { id: 'rent', label: 'Rent / Buy' }

/**
 * Map a raw TMDB provider result to a canonical id.
 * Named-service matching always takes priority (e.g. an "Apple TV" rent listing
 * should show as Apple TV, not just get lumped into the generic Rent/Buy bucket).
 * Only falls through to the generic Rent/Buy id if nothing named matches.
 */
export function canonicalizeProvider(rawProvider) {
  const match = CANONICAL_PROVIDERS.find((p) => p.match(rawProvider.name || ''))
  if (match) return match.id
  if (rawProvider.kind === 'rent' || rawProvider.kind === 'buy') {
    return RENT_PROVIDER.id
  }
  return null
}

export function providerLabel(id) {
  if (id === RENT_PROVIDER.id) return RENT_PROVIDER.label
  return CANONICAL_PROVIDERS.find((p) => p.id === id)?.label || id
}

export const ALL_PROVIDER_FILTER_OPTIONS = [...CANONICAL_PROVIDERS, RENT_PROVIDER]
