import { burstConfetti } from '../utils/confetti'

export default function StatusStub({ statuses, status, onSetStatus, labels }) {
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
