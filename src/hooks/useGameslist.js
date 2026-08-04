import { useCallback, useEffect, useMemo, useState } from 'react'
import { makeTagActions } from './tagHelpers'

const STORAGE_KEY = 'marquee-watchlist:games'

function migrateItem(item) {
  const migrated = { ...item }
  if (!Array.isArray(migrated.tags)) migrated.tags = []
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

export function useGameslist() {
  const [items, setItems] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev
      return [{ ...item, status: 'want', tags: [], addedAt: Date.now() }, ...prev]
    })
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const setStatus = useCallback((id, status) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
  }, [])

  const { toggleTag, renameTag, deleteTag } = useMemo(() => makeTagActions(setItems), [])

  return { items, addItem, removeItem, setStatus, toggleTag, renameTag, deleteTag }
}
