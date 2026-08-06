import { useMemo, useState } from 'react'
import ArticlesHeader from './ArticlesHeader'
import ArticleTile from './ArticleTile'
import TagFilterGroup from './TagFilterGroup'
import { useArticles } from '../hooks/useArticles'
import { READ_STATUSES } from '../utils/format'

const EMPTY_FILTERS = { statuses: new Set(), tags: new Set(), sort: 'title' }

export default function ArticlesTab() {
  const { items, addItem, removeItem, setStatus, toggleTag, renameTag, deleteTag } = useArticles()
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const existingIds = useMemo(() => new Set(items.map((i) => i.id)), [items])

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

  const hasActiveFilters = filters.statuses.size > 0 || filters.tags.size > 0

  const visibleItems = useMemo(() => {
    let list = items.filter((item) => {
      if (filters.statuses.size > 0) {
        if (!filters.statuses.has(item.status)) return false
      } else if (item.status === 'read' && filters.tags.size === 0) {
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

  const readingItems = visibleItems.filter((i) => i.status === 'reading')
  const restItems = visibleItems.filter((i) => i.status !== 'reading')

  return (
    <>
      <ArticlesHeader onAdd={addItem} existingIds={existingIds} />

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

      {readingItems.length > 0 && (
        <>
          <p className="section-heading section-heading-highlight">
            Currently reading · {readingItems.length}
          </p>
          <div className="media-grid media-grid-wide">
            {readingItems.map((item) => (
              <ArticleTile
                key={item.id}
                item={item}
                onSetStatus={setStatus}
                onRemove={removeItem}
                onToggleTag={toggleTag}
                allTags={allTags}
                dimDone={filters.tags.size === 0}
              />
            ))}
          </div>
          <div className="section-divider" />
        </>
      )}

      <p className="section-heading">
        {restItems.length} article{restItems.length === 1 ? '' : 's'} saved
      </p>

      {restItems.length > 0 ? (
        <div className="media-grid media-grid-wide">
          {restItems.map((item) => (
            <ArticleTile
              key={item.id}
              item={item}
              onSetStatus={setStatus}
              onRemove={removeItem}
              onToggleTag={toggleTag}
              allTags={allTags}
              dimDone={filters.tags.size === 0}
            />
          ))}
        </div>
      ) : (
        readingItems.length === 0 && (
          <div className="empty-state">
            <h2>Nothing saved yet</h2>
            <p>Paste a link above to add your first article.</p>
          </div>
        )
      )}
    </>
  )
}
