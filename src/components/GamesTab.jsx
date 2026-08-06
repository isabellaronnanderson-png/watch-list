import { useMemo, useState } from 'react'
import GamesHeader from './GamesHeader'
import GameTicket from './GameTicket'
import TagFilterGroup from './TagFilterGroup'
import { useGameslist } from '../hooks/useGameslist'
import { GAME_STATUSES, LENGTH_BUCKETS, GAME_MODES } from '../utils/format'

const EMPTY_FILTERS = {
  statuses: new Set(),
  genres: new Set(),
  platforms: new Set(),
  lengths: new Set(),
  modes: new Set(),
  tags: new Set(),
  sort: 'title',
}

export default function GamesTab() {
  const { items, addItem, removeItem, setStatus, toggleTag, renameTag, deleteTag } = useGameslist()
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const existingIds = useMemo(() => new Set(items.map((i) => i.id)), [items])

  const allGenres = useMemo(() => {
    const s = new Set()
    items.forEach((i) => i.genres?.forEach((g) => s.add(g)))
    return Array.from(s).sort()
  }, [items])

  const allPlatforms = useMemo(() => {
    const s = new Set()
    items.forEach((i) => i.platforms?.forEach((p) => s.add(p)))
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
    filters.statuses.size > 0 ||
    filters.genres.size > 0 ||
    filters.platforms.size > 0 ||
    filters.lengths.size > 0 ||
    filters.modes.size > 0 ||
    filters.tags.size > 0

  const visibleItems = useMemo(() => {
    let list = items.filter((item) => {
      if (filters.statuses.size > 0) {
        if (!filters.statuses.has(item.status)) return false
      } else if (item.status === 'played' && filters.tags.size === 0) {
        return false
      }
      if (filters.genres.size > 0 && !item.genres?.some((g) => filters.genres.has(g))) return false
      if (filters.platforms.size > 0 && !item.platforms?.some((p) => filters.platforms.has(p)))
        return false
      if (filters.modes.size > 0 && !item.modes?.some((m) => filters.modes.has(m))) return false
      if (filters.tags.size > 0 && !item.tags?.some((t) => filters.tags.has(t))) return false
      if (filters.lengths.size > 0) {
        const bucketMatch = LENGTH_BUCKETS.some(
          (b) => filters.lengths.has(b.id) && b.test(item.playtimeHours)
        )
        if (!bucketMatch) return false
      }
      return true
    })
    list = [...list].sort((a, b) => {
      if (filters.sort === 'title') return a.title.localeCompare(b.title)
      return b.addedAt - a.addedAt
    })
    return list
  }, [items, filters])

  const playingItems = visibleItems.filter((i) => i.status === 'playing')
  const restItems = visibleItems.filter((i) => i.status !== 'playing')

  return (
    <>
      <GamesHeader onAdd={addItem} existingIds={existingIds} />

      <div className="filter-window">
        <div className="filter-group">
          <span className="filter-group-label">Status</span>
          <div className="chip-row">
            {GAME_STATUSES.map((s) => (
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
          <span className="filter-group-label">Console</span>
          <div className="chip-row">
            {allPlatforms.length === 0 && (
              <span className="filter-hint">Add games to populate platforms</span>
            )}
            {allPlatforms.map((p) => (
              <button
                key={p}
                className="chip"
                aria-pressed={filters.platforms.has(p)}
                onClick={() => toggleSetValue('platforms', p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Genre</span>
          <div className="chip-row">
            {allGenres.length === 0 && (
              <span className="filter-hint">Add games to populate genres</span>
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
          <span className="filter-group-label">Length</span>
          <div className="chip-row">
            {LENGTH_BUCKETS.map((b) => (
              <button
                key={b.id}
                className="chip"
                aria-pressed={filters.lengths.has(b.id)}
                onClick={() => toggleSetValue('lengths', b.id)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Mode</span>
          <div className="chip-row">
            {GAME_MODES.map((m) => (
              <button
                key={m.id}
                className="chip"
                aria-pressed={filters.modes.has(m.id)}
                onClick={() => toggleSetValue('modes', m.id)}
              >
                {m.label}
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

      {playingItems.length > 0 && (
        <>
          <p className="section-heading section-heading-highlight">
            Currently playing · {playingItems.length}
          </p>
          <div className="media-grid">
            {playingItems.map((item) => (
              <GameTicket
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
        {restItems.length} game{restItems.length === 1 ? '' : 's'} on the shelf
      </p>

      {restItems.length > 0 ? (
        <div className="media-grid">
          {restItems.map((item) => (
            <GameTicket
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
        playingItems.length === 0 && (
          <div className="empty-state">
            <h2>{items.length > 0 ? 'No games match the filter' : 'No games yet'}</h2>
            <p>
              {items.length > 0
                ? 'Try clearing a filter.'
                : 'Search above to add your first game.'}
            </p>
          </div>
        )
      )}
    </>
  )
}
