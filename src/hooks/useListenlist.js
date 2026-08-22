import { useCallback, useEffect, useMemo, useState } from 'react'
import { makeTagActions } from './tagHelpers'
import { makeRatingActions } from './ratingHelpers'

const STORAGE_KEY = 'marquee-watchlist:listen'

function migrateItem(item) {
  const migrated = { ...item }
  if (!migrated.status) {
    migrated.status = migrated.listened ? 'listened' : 'want'
  }
  if (!Array.isArray(migrated.tags)) migrated.tags = []
  if (typeof migrated.rating !== 'number') migrated.rating = 0
  delete migrated.listened
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

export function useListenlist() {
  const [items, setItems] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item) => {
    setItems((prev) => {
      if (item.id && prev.some((p) => p.id === item.id)) return prev
      return [{ ...item, status: 'want', tags: [], rating: 0, addedAt: Date.now() }, ...prev]
    })
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const setStatus = useCallback((id, status) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
  }, [])

  const { toggleTag, renameTag, deleteTag } = useMemo(() => makeTagActions(setItems), [])
  const { setRating } = useMemo(() => makeRatingActions(setItems), [])

  return { items, addItem, removeItem, setStatus, setRating, toggleTag, renameTag, deleteTag }
}
