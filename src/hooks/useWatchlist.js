import { useEffect, useState, useCallback } from 'react'
import { canonicalizeProvider } from '../utils/providers'

const STORAGE_KEY = 'marquee-watchlist:items'

function deriveStatus(seasons) {
  const watchedCount = seasons.filter(Boolean).length
  if (watchedCount === 0) return 'want'
  if (watchedCount === seasons.length) return 'watched'
  return 'watching'
}

// Repairs items saved by older versions of the app.
function migrateItem(item) {
  const migrated = { ...item }

  if (!migrated.status) {
    migrated.status = migrated.watched ? 'watched' : 'want'
  }

  if (!migrated.providerIds && Array.isArray(migrated.providers)) {
    migrated.providerIds = Array.from(
      new Set(migrated.providers.map(canonicalizeProvider).filter(Boolean))
    )
  }
  if (!migrated.providerIds) migrated.providerIds = []

  // Re-seed per-season tracking for TV shows that predate it (or lost it in an
  // earlier migration). We don't know the true per-season history, so: shows
  // already marked fully watched keep that (all seasons true); anything else
  // starts from scratch (all false) rather than guessing.
  if (migrated.mediaType === 'tv' && !Array.isArray(migrated.seasons) && migrated.numberOfSeasons > 0) {
    const allTrue = migrated.status === 'watched'
    migrated.seasons = Array(migrated.numberOfSeasons).fill(allTrue)
  }

  delete migrated.watched
  delete migrated.providers

  return migrated
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw).map(migrateItem)
  } catch {
    return []
  }
}

export function useWatchlist() {
  const [items, setItems] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev
      const seasons =
        item.mediaType === 'tv' && item.numberOfSeasons > 0
          ? Array(item.numberOfSeasons).fill(false)
          : null
      return [{ ...item, status: 'want', seasons, addedAt: Date.now() }, ...prev]
    })
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  // Movies use this directly (Want / Watching / Watched buttons).
  const setStatus = useCallback((id, status) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
  }, [])

  // TV shows: toggle one season, status is derived from how many are checked.
  const toggleSeason = useCallback((id, seasonIndex) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id || !Array.isArray(p.seasons)) return p
        const seasons = p.seasons.map((s, i) => (i === seasonIndex ? !s : s))
        return { ...p, seasons, status: deriveStatus(seasons) }
      })
    )
  }, [])

  // Called after re-checking TMDB for a TV show's current season count. If a new
  // season has aired, extend the seasons array with unwatched entries and let
  // status fall back out of "watched" so it resurfaces in the main list.
  const updateSeasonCount = useCallback((id, newCount) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id || !Array.isArray(p.seasons) || newCount <= p.seasons.length) return p
        const seasons = [...p.seasons, ...Array(newCount - p.seasons.length).fill(false)]
        return { ...p, seasons, numberOfSeasons: newCount, status: deriveStatus(seasons) }
      })
    )
  }, [])

  return { items, addItem, removeItem, setStatus, toggleSeason, updateSeasonCount }
}
