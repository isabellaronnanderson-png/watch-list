import { useMemo, useState } from 'react'
import ListenHeader from './ListenHeader'
import ListenTile from './ListenTile'
import TagFilterGroup from './TagFilterGroup'
import { useListenlist } from '../hooks/useListenlist'
import { LISTEN_STATUSES } from '../utils/format'

const EMPTY_FILTERS = { genres: new Set(), statuses: new Set(), tags: new Set(), sort: 'title' }

export default function ListenTab() {
  const { items, addItem, removeItem, setStatus, toggleTag, renameTag, deleteTag } = useListenlist()
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const existingIds = useMemo(() => new Set(items.map((i) => i.id)), [items])

  const allGenres = useMemo(() => {
    const s = new Set()
    items.forEach((i) => i.genres?.forEach((g) => s.add(g)))
    return Array.from(s).sort()
  }, [items])

  const allTags = useMemo(() => {
    const s = new Set()
    items.forEach((i) => i.tags?.forEach((t) => s.add(t)))
    const others = Array.from(s).filter((t) => t !== 'Favorite').sort()
    return ['Favorite', ...others]
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
    filters.genres.size > 0 || filters.statuses.size > 0 || filters.tags.size > 0

  const visibleItems = useMemo(() => {
    let list = items.filter((item) => {
      if (filters.statuses.size > 0) {
        if (!filters.statuses.has(item.status)) return false
      } else if (item.status === 'listened' && filters.tags.size === 0) {
        return false
      }
      if (filters.genres.size > 0) {
        const hasGenre = item.genres?.some((g) => filters.genres.has(g))
        if (!hasGenre) return false
      }
      if (filters.tags.size > 0) {
        const hasTag = item.tags?.some((t) => filters.tags.has(t))
        if (!hasTag) return false
      }
      return true
    })
    list = [...list].sort((a, b) => {
      if (filters.sort === 'title') return a.title.localeCompare(b.title)
      return b.addedAt - a.addedAt
    })
    return list
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
              <span className="filter-hint">Add audiobooks to populate genres</span>
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

        <TagFilterGroup
          allTags={allTags}
          selectedTags={filters.tags}
          onToggleTag={(t) => toggleSetValue('tags', t)}
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

      {listeningItems.length > 0 && (
        <>
          <p className="section-heading section-heading-highlight">
            Currently listening · {listeningItems.length}
          </p>
          <div className="media-grid-h">
            {listeningItems.map((item) => (
              <ListenTile
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
        {restItems.length} item{restItems.length === 1 ? '' : 's'} in the queue
      </p>

      {restItems.length > 0 ? (
        <div className="media-grid-h">
          {restItems.map((item) => (
            <ListenTile
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
