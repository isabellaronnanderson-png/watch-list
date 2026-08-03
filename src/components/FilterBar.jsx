import { RUNTIME_BUCKETS, MEDIA_TYPES, WATCH_STATUSES } from '../utils/format'
import { ALL_PROVIDER_FILTER_OPTIONS } from '../utils/providers'

export default function FilterBar({
  allGenres,
  allTags,
  filters,
  onToggleGenre,
  onToggleRuntime,
  onToggleProvider,
  onToggleMediaType,
  onToggleStatus,
  onToggleTag,
  onSortChange,
  onClear,
  hasActiveFilters,
}) {
  return (
    <div className="filter-window">
      <div className="filter-group">
        <span className="filter-group-label">Status</span>
        <div className="chip-row">
          {WATCH_STATUSES.map((s) => (
            <button
              key={s.id}
              className="chip"
              aria-pressed={filters.statuses.has(s.id)}
              onClick={() => onToggleStatus(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group-label">Type</span>
        <div className="chip-row">
          {MEDIA_TYPES.map((t) => (
            <button
              key={t.id}
              className="chip"
              aria-pressed={filters.mediaTypes.has(t.id)}
              onClick={() => onToggleMediaType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group-label">Genre</span>
        <div className="chip-row">
          {allGenres.length === 0 && (
            <span className="filter-hint">Add titles to populate genres</span>
          )}
          {allGenres.map((g) => (
            <button
              key={g}
              className="chip"
              aria-pressed={filters.genres.has(g)}
              onClick={() => onToggleGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group-label">Tags</span>
        <div className="chip-row">
          {allTags.map((t) => (
            <button
              key={t}
              className="chip"
              aria-pressed={filters.tags.has(t)}
              onClick={() => onToggleTag(t)}
            >
              {t === 'Favorite' ? '★ Favorite' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group-label">Runtime</span>
        <div className="chip-row">
          {RUNTIME_BUCKETS.map((b) => (
            <button
              key={b.id}
              className="chip"
              aria-pressed={filters.runtimes.has(b.id)}
              onClick={() => onToggleRuntime(b.id)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group-label">Streaming on</span>
        <div className="chip-row">
          {ALL_PROVIDER_FILTER_OPTIONS.map((p) => (
            <button
              key={p.id}
              className="chip"
              aria-pressed={filters.providers.has(p.id)}
              onClick={() => onToggleProvider(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group-label">Sort</span>
        <select
          className="filter-select"
          value={filters.sort}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="added">Recently added</option>
          <option value="title">Title A–Z</option>
          <option value="runtime">Runtime, shortest first</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button className="filter-clear" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  )
}
