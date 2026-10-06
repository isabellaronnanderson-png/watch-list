import { useRef, useState } from 'react'
import { burstConfetti } from '../utils/confetti'

// Shown on a card the moment something is marked done. Picking a star fills
// the row with a staggered pop and a confetti burst, then commits the rating
// a beat later so the animation actually gets to play before the card settles.
export default function InlineRatingPrompt({ rating, onSetRating, onSkip }) {
  const [hover, setHover] = useState(0)
  const [chosen, setChosen] = useState(0)
  const starRefs = useRef([])

  function choose(n) {
    if (chosen) return
    setChosen(n)
    const rect = starRefs.current[n - 1]?.getBoundingClientRect()
    if (rect) {
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      burstConfetti(x, y)
      if (n === 5) {
        burstConfetti(x - 70, y)
        burstConfetti(x + 70, y)
      }
    }
    setTimeout(() => onSetRating(n), 800)
  }

  const shown = hover || chosen || rating

  return (
    <div className={`inline-rating-prompt${chosen ? ' is-chosen' : ''}`}>
      <span className="inline-rating-label">{chosen ? 'Nice!' : 'How was it?'}</span>
      <div className="inline-stars" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            ref={(el) => {
              starRefs.current[n - 1] = el
            }}
            className={`inline-star${n <= shown ? ' is-filled' : ''}${chosen && n <= chosen ? ' is-popped' : ''}`}
            style={{ '--i': n }}
            onMouseEnter={() => setHover(n)}
            onClick={() => choose(n)}
            aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      {!chosen && (
        <button type="button" className="inline-rating-skip" onClick={onSkip}>
          Skip
        </button>
      )}
    </div>
  )
}
