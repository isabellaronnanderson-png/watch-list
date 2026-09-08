import StarRating from './StarRating'

export default function InlineRatingPrompt({ rating, onSetRating, onSkip }) {
  return (
    <div className="inline-rating-prompt">
      <span className="inline-rating-label">Rate it?</span>
      <StarRating rating={rating} onSetRating={onSetRating} />
      <button type="button" className="inline-rating-skip" onClick={onSkip}>
        Skip
      </button>
    </div>
  )
}
