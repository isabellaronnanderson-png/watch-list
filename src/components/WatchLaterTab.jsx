import { useMemo, useState } from 'react'
import WatchLaterHeader from './WatchLaterHeader'
import WatchLaterTile from './WatchLaterTile'
import { useWatchLater } from '../hooks/useWatchLater'
import { WATCH_STATUSES } from '../utils/format'

const EMPTY_FILTERS = { statuses: new Set() }

export default function WatchLaterTab() {
  const { items, addItem, removeItem, setStatus } = useWatchLater()
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const existingIds = useMemo(() => new Set(items.map((i) => i.id)), [items])

  function toggleStatus(s) {
    setFilters((prev) => {
      const next = new Set(prev.statuses)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return { ...prev, statuses: next }
    })
  }

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => filters.statuses.size === 0 || filters.statuses.has(item.status))
      .sort((a, b) => b.addedAt - a.addedAt)
  }, [items, filters])

  const watchingItems = visibleItems.filter((i) => i.status === 'watching')
  const restItems = visibleItems.filter((i) => i.status !== 'watching')

  return (
    <>
      <WatchLaterHeader onAdd={addItem} existingIds={existingIds} />

      <div className="filter-window">
        <div className="filter-group">
          <span className="filter-group-label">Status</span>
          <div className="chip-row">
            {WATCH_STATUSES.map((s) => (
              <button
                key={s.id}
                className="chip"
                aria-pressed={filters.statuses.has(s.id)}
                onClick={() => toggleStatus(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {filters.statuses.size > 0 && (
          <button className="filter-clear" onClick={() => setFilters(EMPTY_FILTERS)}>
            Clear filters
          </button>
        )}
      </div>

      {watchingItems.length > 0 && (
        <>
          <p className="section-heading section-heading-highlight">
            Currently watching · {watchingItems.length}
          </p>
          <div className="media-grid media-grid-wide">
            {watchingItems.map((item) => (
              <WatchLaterTile key={item.id} item={item} onSetStatus={setStatus} onRemove={removeItem} />
            ))}
          </div>
          <div className="section-divider" />
        </>
      )}

      <p className="section-heading">
        {restItems.length} video{restItems.length === 1 ? '' : 's'} queued
      </p>

      {restItems.length > 0 ? (
        <div className="media-grid media-grid-wide">
          {restItems.map((item) => (
            <WatchLaterTile key={item.id} item={item} onSetStatus={setStatus} onRemove={removeItem} />
          ))}
        </div>
      ) : (
        watchingItems.length === 0 && (
          <div className="empty-state">
            <h2>Nothing queued</h2>
            <p>Paste a link above to add your first video.</p>
          </div>
        )
      )}
    </>
  )
}
