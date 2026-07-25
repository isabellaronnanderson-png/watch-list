import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'marquee-watchlist:listen'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useListenlist() {
  const [items, setItems] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item) => {
    setItems((prev) => {
      if (item.id && prev.some((p) => p.id === item.id)) return prev
      return [{ ...item, listened: false, addedAt: Date.now() }, ...prev]
    })
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const toggleListened = useCallback((id) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, listened: !p.listened } : p))
    )
  }, [])

  return { items, addItem, removeItem, toggleListened }
}
