import { useMemo, useState } from 'react'
import WatchLaterHeader from './WatchLaterHeader'
import WatchLaterTile from './WatchLaterTile'
import TagFilterGroup from './TagFilterGroup'
import { useWatchLater } from '../hooks/useWatchLater'
import { WATCH_STATUSES } from '../utils/format'

const EMPTY_FILTERS = { statuses: new Set(), tags: new Set(), sort: 'title' }

export default function WatchLaterTab() {
  const { items, addItem, removeItem, setStatus, toggleTag, renameTag, deleteTag } = useWatchLater()
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const existingIds = useMemo(() => new Set(items.map((i) => i.id)), [items])

  const allTags = useMemo(() => {
    const s = new Set()
    items.forEach((i) => i.tags?.forEach((t) => s.add(t)))
    const others = Array.from(s).filter((t) => t !== 'Favorite').sort()
    return ['Favorite', ...others]
  }, [items])

  function toggleStatus(s) {
    setFilters((prev) => {
      const next = new Set(prev.statuses)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return { ...prev, statuses: next }
    })
  }

  function toggleTagFilter(t) {
    setFilters((prev) => {
      const next = new Set(prev.tags)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return { ...prev, tags: next }
    })
  }

  const hasActiveFilters = filters.statuses.size > 0 || filters.tags.size > 0

  const visibleItems = useMemo(() => {
    let list = items.filter((item) => {
      if (filters.statuses.size > 0) {
        if (!filters.statuses.has(item.status)) return false
      } else if (item.status === 'watched' && filters.tags.size === 0) {
        return false
      }
      if (filters.tags.size > 0 && !item.tags?.some((t) => filters.tags.has(t))) return false
      return true
    })
    list = [...list].sort((a, b) => {
      if (filters.sort === 'title') return a.title.localeCompare(b.title)
      return b.addedAt - a.addedAt
    })
    return list
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

        <TagFilterGroup
          allTags={allTags}
          selectedTags={filters.tags}
          onToggleTag={toggleTagFilter}
          onRenameTag={renameTag}
          onDeleteTag={deleteTag}
        />

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

      {watchingItems.length > 0 && (
        <>
          <p className="section-heading section-heading-highlight">
            Currently watching · {watchingItems.length}
          </p>
          <div className="media-grid media-grid-wide">
            {watchingItems.map((item) => (
              <WatchLaterTile
                key={item.id}
                item={item}
                onSetStatus={setStatus}
                onRemove={removeItem}
                onToggleTag={toggleTag}
                allTags={allTags}
              />
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
            <WatchLaterTile
              key={item.id}
              item={item}
              onSetStatus={setStatus}
              onRemove={removeItem}
              onToggleTag={toggleTag}
              allTags={allTags}
            />
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
