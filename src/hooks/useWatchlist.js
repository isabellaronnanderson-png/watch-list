import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'marquee-watchlist:items'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
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
      return [{ ...item, watched: false, seasons, addedAt: Date.now() }, ...prev]
    })
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  // For films: simple on/off toggle.
  const toggleWatched = useCallback((id) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, watched: !p.watched } : p))
    )
  }, [])

  // For TV shows: toggle one season, and mark the whole show watched once every season is.
  const toggleSeason = useCallback((id, seasonIndex) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id || !p.seasons) return p
        const seasons = p.seasons.map((s, i) => (i === seasonIndex ? !s : s))
        return { ...p, seasons, watched: seasons.every(Boolean) }
      })
    )
  }, [])

  return { items, addItem, removeItem, toggleWatched, toggleSeason }
}
