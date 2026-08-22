export default function StarRating({ rating = 0, onSetRating }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-btn${n <= rating ? ' is-filled' : ''}`}
          onClick={() => onSetRating(n === rating ? 0 : n)}
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
          title={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
