import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'marquee-watchlist:youtube'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useWatchLater() {
  const [items, setItems] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev
      return [{ ...item, watched: false, addedAt: Date.now() }, ...prev]
    })
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const toggleWatched = useCallback((id) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, watched: !p.watched } : p))
    )
  }, [])

  return { items, addItem, removeItem, toggleWatched }
}
