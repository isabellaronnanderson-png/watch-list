import { useCallback, useEffect, useMemo, useState } from 'react'
import { makeTagActions } from './tagHelpers'
import { useAuthContext } from './AuthContext'
import { useCloudSync } from './useCloudSync'
import { makeRatingActions } from './ratingHelpers'

const STORAGE_KEY = 'marquee-watchlist:games'

function migrateItem(item) {
  const migrated = { ...item }
  if (!Array.isArray(migrated.tags)) migrated.tags = []
  if (typeof migrated.rating !== 'number') migrated.rating = 0
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
  const { user } = useAuthContext()
  useCloudSync('games', user, items, setItems)


  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev
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
