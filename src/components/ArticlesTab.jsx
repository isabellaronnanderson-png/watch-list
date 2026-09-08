import { useMemo, useState } from 'react'
import ArticlesHeader from './ArticlesHeader'
import ArticleTile from './ArticleTile'
import TagFilterGroup from './TagFilterGroup'
import RatingFilterGroup from './RatingFilterGroup'
import { useArticles } from '../hooks/useArticles'
import { READ_STATUSES } from '../utils/format'
import MobileFilterToggle from './MobileFilterToggle'

const EMPTY_FILTERS = { statuses: new Set(), tags: new Set(), ratings: new Set(), sort: 'title' }

export default function ArticlesTab() {
  const { items, addItem, removeItem, setStatus, setRating, toggleTag, renameTag, deleteTag } = useArticles()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [justCompletedIds, setJustCompletedIds] = useState(new Set())
  const [pendingWasInProgress, setPendingWasInProgress] = useState(new Set())

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

  // Marking something done removes it from the default view - but if it
  // just happened this session, keep it visible (dimmed) until the person
  // acts on the rating prompt, rather than yanking the card out from under them.
  function handleSetStatus(id, status) {
    if (status === 'read') {
      const current = items.find((i) => i.id === id)
      setJustCompletedIds((prev) => new Set(prev).add(id))
      if (current?.status === 'reading') {
        setPendingWasInProgress((prev) => new Set(prev).add(id))
      }
    }
    setStatus(id, status)
  }

  function handleSetRating(id, rating) {
    setJustCompletedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setPendingWasInProgress((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setRating(id, rating)
  }

  function handleSkipRating(id) {
    setJustCompletedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setPendingWasInProgress((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const hasActiveFilters =
    filters.statuses.size > 0 || filters.tags.size > 0 || filters.ratings.size > 0

  const visibleItems = useMemo(() => {
    let list = items.filter((item) => {
      if (filters.statuses.size > 0) {
        if (!filters.statuses.has(item.status)) return false
      } else if (item.status === 'read' && filters.tags.size === 0 && !justCompletedIds.has(item.id)) {
        return false
      }
      if (filters.tags.size > 0 && !item.tags?.some((t) => filters.tags.has(t))) return false
      if (filters.ratings.size > 0 && !filters.ratings.has(item.rating)) return false
      return true
    })
    list = [...list].sort((a, b) => {
      if (filters.sort === 'title') return a.title.localeCompare(b.title)
      return b.addedAt - a.addedAt
    })
    return list
  }, [items, filters, justCompletedIds])

  const readingItems = visibleItems.filter(
    (i) => i.status === 'reading' || pendingWasInProgress.has(i.id)
  )
  const restItems = visibleItems.filter(
    (i) => i.status !== 'reading' && !pendingWasInProgress.has(i.id)
  )

  return (
    <>
      <ArticlesHeader onAdd={addItem} existingIds={existingIds} />

      <MobileFilterToggle>
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

        <RatingFilterGroup
          selectedRatings={filters.ratings}
          onToggleRating={(r) => toggleSetValue('ratings', r)}
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
      </MobileFilterToggle>

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
                onSetStatus={handleSetStatus}
                onRemove={removeItem}
                onToggleTag={toggleTag}
                onSetRating={handleSetRating}
                onSkipRating={handleSkipRating}
                isPendingRating={justCompletedIds.has(item.id)}
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
              onSetStatus={handleSetStatus}
              onRemove={removeItem}
              onToggleTag={toggleTag}
              onSetRating={handleSetRating}
                onSkipRating={handleSkipRating}
                isPendingRating={justCompletedIds.has(item.id)}
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
