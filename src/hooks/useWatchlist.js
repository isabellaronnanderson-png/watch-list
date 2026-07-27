import { useEffect, useState, useCallback } from 'react'
import { canonicalizeProvider } from '../utils/providers'

const STORAGE_KEY = 'marquee-watchlist:items'

// Repairs items saved by older versions of the app:
// - `watched: true/false` -> `status: 'watched'/'want'`
// - `providers: [...raw TMDB objects]` (pre-simplification) -> `providerIds: [...]`
// - drops the old per-season array; season tracking was replaced by `status`
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

  delete migrated.watched
  delete migrated.providers
  delete migrated.seasons

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
      return [{ ...item, status: 'want', addedAt: Date.now() }, ...prev]
    })
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const setStatus = useCallback((id, status) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
  }, [])

  return { items, addItem, removeItem, setStatus }
}
