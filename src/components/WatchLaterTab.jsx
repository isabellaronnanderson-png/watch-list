import { useMemo, useState } from 'react'
import WatchLaterHeader from './WatchLaterHeader'
import WatchLaterTile from './WatchLaterTile'
import { useWatchLater } from '../hooks/useWatchLater'

export default function WatchLaterTab() {
  const { items, addItem, removeItem, toggleWatched } = useWatchLater()
  const [status, setStatus] = useState('all')

  const existingIds = useMemo(() => new Set(items.map((i) => i.id)), [items])

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => {
        if (status === 'queued' && item.watched) return false
        if (status === 'watched' && !item.watched) return false
        return true
      })
      .sort((a, b) => b.addedAt - a.addedAt)
  }, [items, status])

  return (
    <>
      <WatchLaterHeader onAdd={addItem} existingIds={existingIds} />

      <div className="filter-window">
        <div className="filter-group">
          <span className="filter-group-label">Status</span>
          <div className="chip-row">
            {[
              { id: 'all', label: 'All' },
              { id: 'queued', label: 'Queued' },
              { id: 'watched', label: 'Watched' },
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
        {visibleItems.length} video{visibleItems.length === 1 ? '' : 's'} queued
      </p>

      {visibleItems.length > 0 ? (
        <div className="reel-grid">
          {visibleItems.map((item) => (
            <WatchLaterTile
              key={item.id}
              item={item}
              onToggleWatched={toggleWatched}
              onRemove={removeItem}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Nothing queued</h2>
          <p>Paste a link above to add your first video.</p>
        </div>
      )}
    </>
  )
}
