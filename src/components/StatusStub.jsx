import { burstConfetti } from '../utils/confetti'
import { showRatingPrompt } from '../utils/ratingPromptStore'

export default function StatusStub({ statuses, status, onSetStatus, labels, rating, onSetRating }) {
  const doneId = statuses[statuses.length - 1].id

  return (
    <div className="stub-status">
      {statuses.map((s) => (
        <button
          key={s.id}
          className={`stub-status-btn status-${s.id}${status === s.id ? ' is-active' : ''}`}
          onClick={(e) => {
            if (s.id === doneId && status !== doneId) {
              burstConfetti(e.clientX, e.clientY)
              if (onSetRating) {
                showRatingPrompt({ x: e.clientX, y: e.clientY, rating, onSetRating })
              }
            }
            onSetStatus(s.id)
          }}
        >
          {labels?.[s.id] || s.label}
        </button>
      ))}
    </div>
  )
}
