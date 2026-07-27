import { useEffect, useMemo, useState } from 'react'
import Header from './Header'
import FilterBar from './FilterBar'
import TicketGrid, { EmptyState } from './TicketGrid'
import { useWatchlist } from '../hooks/useWatchlist'
import { getGenreMaps } from '../api/tmdb'
import { RUNTIME_BUCKETS } from '../utils/format'

const EMPTY_FILTERS = {
  genres: new Set(),
  runtimes: new Set(),
  providers: new Set(),
  mediaTypes: new Set(),
  statuses: new Set(),
  sort: 'added',
}

export default function WatchTab() {
  const { items, addItem, removeItem, setStatus } = useWatchlist()
  const [genreMaps, setGenreMaps] = useState(null)
  const [configError, setConfigError] = useState(null)
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  useEffect(() => {
    getGenreMaps()
      .then(setGenreMaps)
      .catch((err) => setConfigError(err.message))
  }, [])

  const existingIds = useMemo(() => new Set(items.map((i) => i.id)), [items])

  const allGenres = useMemo(() => {
    const s = new Set()
    items.forEach((i) => i.genres?.forEach((g) => s.add(g)))
    return Array.from(s).sort()
  }, [items])

  function toggleSetValue(setName, value) {
    setFilters((prev) => {
      const next = new Set(prev[setName])
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return { ...prev, [setName]: next }
    })
  }

  const hasActiveFilters =
    filters.genres.size > 0 ||
    filters.runtimes.size > 0 ||
    filters.providers.size > 0 ||
    filters.mediaTypes.size > 0 ||
    filters.statuses.size > 0

  const visibleItems = useMemo(() => {
    let list = items.filter((item) => {
      if (filters.mediaTypes.size > 0 && !filters.mediaTypes.has(item.mediaType)) {
        return false
      }
      if (filters.statuses.size > 0 && !filters.statuses.has(item.status)) {
        return false
      }
      if (filters.genres.size > 0) {
        const hasGenre = item.genres?.some((g) => filters.genres.has(g))
        if (!hasGenre) return false
      }
      if (filters.runtimes.size > 0) {
        const bucketMatch = RUNTIME_BUCKETS.some(
          (b) => filters.runtimes.has(b.id) && b.test(item.runtimeMinutes)
        )
        if (!bucketMatch) return false
      }
      if (filters.providers.size > 0) {
        const hasProvider = item.providerIds?.some((pid) => filters.providers.has(pid))
        if (!hasProvider) return false
      }
      return true
    })

    list = [...list].sort((a, b) => {
      if (filters.sort === 'title') return a.title.localeCompare(b.title)
      if (filters.sort === 'runtime')
        return (a.runtimeMinutes || 9999) - (b.runtimeMinutes || 9999)
      return b.addedAt - a.addedAt
    })

    return list
  }, [items, filters])

  const watchingItems = visibleItems.filter((i) => i.status === 'watching')
  const restItems = visibleItems.filter((i) => i.status !== 'watching')

  return (
    <>
      <Header onAdd={addItem} existingIds={existingIds} genreMaps={genreMaps} />

      {configError && (
        <div className="config-warning">
          {configError} — copy <code>.env.example</code> to <code>.env</code>, add your key, and
          restart the dev server.
        </div>
      )}

      <FilterBar
        allGenres={allGenres}
        filters={filters}
        onToggleGenre={(g) => toggleSetValue('genres', g)}
        onToggleRuntime={(r) => toggleSetValue('runtimes', r)}
        onToggleProvider={(p) => toggleSetValue('providers', p)}
        onToggleMediaType={(t) => toggleSetValue('mediaTypes', t)}
        onToggleStatus={(s) => toggleSetValue('statuses', s)}
        onSortChange={(sort) => setFilters((prev) => ({ ...prev, sort }))}
        onClear={() => setFilters(EMPTY_FILTERS)}
        hasActiveFilters={hasActiveFilters}
      />

      {watchingItems.length > 0 && (
        <>
          <p className="section-heading section-heading-highlight">
            Currently watching · {watchingItems.length}
          </p>
          <TicketGrid items={watchingItems} onSetStatus={setStatus} onRemove={removeItem} />
          <div className="section-divider" />
        </>
      )}

      <p className="section-heading">
        {restItems.length} title{restItems.length === 1 ? '' : 's'} on the reel
      </p>

      {restItems.length > 0 ? (
        <TicketGrid items={restItems} onSetStatus={setStatus} onRemove={removeItem} />
      ) : (
        watchingItems.length === 0 && <EmptyState hasAnyItems={items.length > 0} />
      )}
    </>
  )
}
