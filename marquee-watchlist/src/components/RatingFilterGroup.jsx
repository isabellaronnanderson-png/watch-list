export default function RatingFilterGroup({ selectedRatings, onToggleRating }) {
  return (
    <div className="filter-group">
      <span className="filter-group-label">Rating</span>
      <div className="chip-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className="chip"
            aria-pressed={selectedRatings.has(n)}
            onClick={() => onToggleRating(n)}
          >
            {'★'.repeat(n)}
          </button>
        ))}
      </div>
    </div>
  )
}
