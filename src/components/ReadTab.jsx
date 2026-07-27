import { useMemo, useState } from 'react'
import ReadHeader from './ReadHeader'
import BookTicket from './BookTicket'
import { useReadlist } from '../hooks/useReadlist'
import { READ_STATUSES } from '../utils/format'

const EMPTY_FILTERS = { genres: new Set(), statuses: new Set(), sort: 'added' }

export default function ReadTab() {
  const { items, addItem, removeItem, setStatus } = useReadlist()
  const [filters, setFilters] = useState(EMPTY_FILTERS)

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

  const hasActiveFilters = filters.genres.size > 0 || filters.statuses.size > 0

  const visibleItems = useMemo(() => {
    let list = items.filter((item) => {
      if (filters.statuses.size > 0 && !filters.statuses.has(item.status)) return false
      if (filters.genres.size > 0) {
        const hasGenre = item.genres?.some((g) => filters.genres.has(g))
        if (!hasGenre) return false
      }
      return true
    })
    list = [...list].sort((a, b) => {
      if (filters.sort === 'title') return a.title.localeCompare(b.title)
      return b.addedAt - a.addedAt
    })
    return list
  }, [items, filters])

  const readingItems = visibleItems.filter((i) => i.status === 'reading')
  const restItems = visibleItems.filter((i) => i.status !== 'reading')

  return (
    <>
      <ReadHeader onAdd={addItem} existingIds={existingIds} />

      <div className="filter-window">
        <div className="filter-group">
          <span className="filter-group-label">Status</span>
          <div className="chip-row">
            {READ_STATUSES.map((s) => (
              <button
                key={s.id}
                className="chip"
                aria-pressed={filters.statuses.has(s.id)}
                onClick={() => toggleSetValue('statuses', s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Genre</span>
          <div className="chip-row">
            {allGenres.length === 0 && (
              <span className="stub-admit">Add books to populate genres</span>
            )}
            {allGenres.map((g) => (
              <button
                key={g}
                className="chip"
                aria-pressed={filters.genres.has(g)}
                onClick={() => toggleSetValue('genres', g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Sort</span>
          <select
            className="filter-select"
            value={filters.sort}
            onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
          >
            <option value="added">Recently added</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button className="filter-clear" onClick={() => setFilters(EMPTY_FILTERS)}>
            Clear filters
          </button>
        )}
      </div>

      {readingItems.length > 0 && (
        <>
          <p className="section-heading section-heading-highlight">
            Currently reading · {readingItems.length}
          </p>
          <div className="ticket-grid">
            {readingItems.map((item) => (
              <BookTicket key={item.id} item={item} onSetStatus={setStatus} onRemove={removeItem} />
            ))}
          </div>
          <div className="section-divider" />
        </>
      )}

      <p className="section-heading">
        {restItems.length} book{restItems.length === 1 ? '' : 's'} on the shelf
      </p>

      {restItems.length > 0 ? (
        <div className="ticket-grid">
          {restItems.map((item) => (
            <BookTicket key={item.id} item={item} onSetStatus={setStatus} onRemove={removeItem} />
          ))}
        </div>
      ) : (
        readingItems.length === 0 && (
          <div className="empty-state">
            <h2>{items.length > 0 ? 'No books match the filter' : 'The shelf is bare'}</h2>
            <p>
              {items.length > 0
                ? 'Try clearing a filter.'
                : 'Search above to check out your first book.'}
            </p>
          </div>
        )
      )}
    </>
  )
}
