import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'marquee-watchlist:games'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useGameslist() {
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
