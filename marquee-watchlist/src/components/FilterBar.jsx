import { RUNTIME_BUCKETS } from '../utils/format'

export default function FilterBar({
  allGenres,
  allProviders,
  filters,
  onToggleGenre,
  onToggleRuntime,
  onToggleProvider,
  onSortChange,
  onClear,
  hasActiveFilters,
}) {
  return (
    <div className="filter-window">
      <div className="filter-group">
        <span className="filter-group-label">Genre</span>
        <div className="chip-row">
          {allGenres.length === 0 && (
            <span className="stub-admit">Add titles to populate genres</span>
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
          {allProviders.length === 0 && (
            <span className="stub-admit">No providers found yet</span>
          )}
          {allProviders.map((p) => (
            <button
              key={p}
              className="chip"
              aria-pressed={filters.providers.has(p)}
              onClick={() => onToggleProvider(p)}
            >
              {p}
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
