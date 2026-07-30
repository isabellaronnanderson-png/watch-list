import { useMemo, useState } from 'react'
import ListenHeader from './ListenHeader'
import ListenTile from './ListenTile'
import { useListenlist } from '../hooks/useListenlist'
import { LISTEN_STATUSES } from '../utils/format'

const EMPTY_FILTERS = { statuses: new Set() }

export default function ListenTab() {
  const { items, addItem, removeItem, setStatus } = useListenlist()
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

  const listeningItems = visibleItems.filter((i) => i.status === 'listening')
  const restItems = visibleItems.filter((i) => i.status !== 'listening')

  return (
    <>
      <ListenHeader onAdd={addItem} existingIds={existingIds} />

      <div className="filter-window">
        <div className="filter-group">
          <span className="filter-group-label">Status</span>
          <div className="chip-row">
            {LISTEN_STATUSES.map((s) => (
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

      {listeningItems.length > 0 && (
        <>
          <p className="section-heading section-heading-highlight">
            Currently listening · {listeningItems.length}
          </p>
          <div className="media-grid-h">
            {listeningItems.map((item) => (
              <ListenTile key={item.id} item={item} onSetStatus={setStatus} onRemove={removeItem} />
            ))}
          </div>
          <div className="section-divider" />
        </>
      )}

      <p className="section-heading">
        {restItems.length} item{restItems.length === 1 ? '' : 's'} in the queue
      </p>

      {restItems.length > 0 ? (
        <div className="media-grid-h">
          {restItems.map((item) => (
            <ListenTile key={item.id} item={item} onSetStatus={setStatus} onRemove={removeItem} />
          ))}
        </div>
      ) : (
        listeningItems.length === 0 && (
          <div className="empty-state">
            <h2>Nothing queued up</h2>
            <p>Search for an audiobook above, or add a podcast episode by hand.</p>
          </div>
        )
      )}
    </>
  )
}
