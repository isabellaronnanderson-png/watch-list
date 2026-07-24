import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import TicketGrid, { EmptyState } from './components/TicketGrid'
import { useWatchlist } from './hooks/useWatchlist'
import { getGenreMaps } from './api/tmdb'
import { RUNTIME_BUCKETS } from './utils/format'

const EMPTY_FILTERS = {
  genres: new Set(),
  runtimes: new Set(),
  providers: new Set(),
  sort: 'added',
}

export default function App() {
  const { items, addItem, removeItem, toggleWatched } = useWatchlist()
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

  const allProviders = useMemo(() => {
    const s = new Set()
    items.forEach((i) =>
      i.providers?.forEach((p) => {
        if (p.kind === 'stream') s.add(p.name)
      })
    )
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
    filters.genres.size > 0 || filters.runtimes.size > 0 || filters.providers.size > 0

  const visibleItems = useMemo(() => {
    let list = items.filter((item) => {
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
        const hasProvider = item.providers?.some(
          (p) => p.kind === 'stream' && filters.providers.has(p.name)
        )
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

  return (
    <div className="app-shell">
      <Header onAdd={addItem} existingIds={existingIds} genreMaps={genreMaps} />

      {configError && (
        <div className="config-warning">
          {configError} — copy <code>.env.example</code> to <code>.env</code>, add your key, and
          restart the dev server.
        </div>
      )}

      <FilterBar
        allGenres={allGenres}
        allProviders={allProviders}
        filters={filters}
        onToggleGenre={(g) => toggleSetValue('genres', g)}
        onToggleRuntime={(r) => toggleSetValue('runtimes', r)}
        onToggleProvider={(p) => toggleSetValue('providers', p)}
        onSortChange={(sort) => setFilters((prev) => ({ ...prev, sort }))}
        onClear={() => setFilters(EMPTY_FILTERS)}
        hasActiveFilters={hasActiveFilters}
      />

      <p className="section-heading">
        {visibleItems.length} title{visibleItems.length === 1 ? '' : 's'} on the reel
      </p>

      {visibleItems.length > 0 ? (
        <TicketGrid
          items={visibleItems}
          onToggleWatched={toggleWatched}
          onRemove={removeItem}
        />
      ) : (
        <EmptyState hasAnyItems={items.length > 0} />
      )}
    </div>
  )
}
