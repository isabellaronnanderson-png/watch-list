import { useEffect, useRef } from 'react'
import { supabase, supabaseEnabled } from '../api/supabaseClient'

/**
 * Keeps a tab's items in sync with a single row in the `lists` table
 * (one row per user per list_key, items stored as one JSON blob - mirrors the
 * localStorage shape this app already used, so hooks barely have to change).
 *
 * On login: fetches the cloud copy and adopts it. If there's no cloud copy yet
 * but there's local data (e.g. from before logging in, or from a device that
 * hasn't synced), pushes the local copy up instead of silently discarding it.
 *
 * After that: any local change is pushed to the cloud (debounced) so it
 * survives a cleared cache or shows up on another device.
 */
export function useCloudSync(listKey, user, items, setItems) {
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    hasLoadedRef.current = false
    if (!supabaseEnabled || !user) return
    let cancelled = false

    async function load() {
      try {
        const { data, error } = await supabase
          .from('lists')
          .select('items')
          .eq('user_id', user.id)
          .eq('list_key', listKey)
          .maybeSingle()

        if (cancelled) return
        if (error) throw error

        if (data?.items) {
          setItems(data.items)
        } else {
          setItems((current) => {
            if (current.length > 0) {
              supabase
                .from('lists')
                .upsert({
                  user_id: user.id,
                  list_key: listKey,
                  items: current,
                  updated_at: new Date().toISOString(),
                })
                .then(() => {})
            }
            return current
          })
        }
      } catch (err) {
        console.error(`Cloud sync load failed for ${listKey}:`, err.message)
      } finally {
        if (!cancelled) hasLoadedRef.current = true
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, listKey])

  useEffect(() => {
    if (!supabaseEnabled || !user || !hasLoadedRef.current) return

    const timer = setTimeout(() => {
      supabase
        .from('lists')
        .upsert({
          user_id: user.id,
          list_key: listKey,
          items,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.error(`Cloud sync save failed for ${listKey}:`, error.message)
        })
    }, 600)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, user?.id, listKey])
}
