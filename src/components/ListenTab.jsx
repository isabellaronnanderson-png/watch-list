import { useMemo, useState } from 'react'
import ListenHeader from './ListenHeader'
import ListenTile from './ListenTile'
import { useListenlist } from '../hooks/useListenlist'

export default function ListenTab() {
  const { items, addItem, removeItem, toggleListened } = useListenlist()
  const [status, setStatus] = useState('all')

  const existingIds = useMemo(() => new Set(items.map((i) => i.id)), [items])

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => {
        if (status === 'queued' && item.listened) return false
        if (status === 'listened' && !item.listened) return false
        return true
      })
      .sort((a, b) => b.addedAt - a.addedAt)
  }, [items, status])

  return (
    <>
      <ListenHeader onAdd={addItem} existingIds={existingIds} />

      <div className="filter-window">
        <div className="filter-group">
          <span className="filter-group-label">Status</span>
          <div className="chip-row">
            {[
              { id: 'all', label: 'All' },
              { id: 'queued', label: 'Queued' },
              { id: 'listened', label: 'Listened' },
            ].map((s) => (
              <button
                key={s.id}
                className="chip"
                aria-pressed={status === s.id}
                onClick={() => setStatus(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="section-heading">
        {visibleItems.length} item{visibleItems.length === 1 ? '' : 's'} in the queue
      </p>

      {visibleItems.length > 0 ? (
        <div className="listen-grid">
          {visibleItems.map((item) => (
            <ListenTile
              key={item.id}
              item={item}
              onToggleListened={toggleListened}
              onRemove={removeItem}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Nothing queued up</h2>
          <p>Search for an audiobook above, or add a podcast episode by hand.</p>
        </div>
      )}
    </>
  )
}
