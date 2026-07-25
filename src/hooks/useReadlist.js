import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'marquee-watchlist:books'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useReadlist() {
  const [items, setItems] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev
      return [{ ...item, read: false, addedAt: Date.now() }, ...prev]
    })
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const toggleRead = useCallback((id) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, read: !p.read } : p)))
  }, [])

  return { items, addItem, removeItem, toggleRead }
}
