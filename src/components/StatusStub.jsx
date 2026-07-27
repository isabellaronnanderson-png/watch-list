export default function StatusStub({ statuses, status, onSetStatus, labels }) {
  return (
    <div className="stub-status">
      {statuses.map((s) => (
        <button
          key={s.id}
          className={`stub-status-btn status-${s.id}${status === s.id ? ' is-active' : ''}`}
          onClick={() => onSetStatus(s.id)}
        >
          {labels?.[s.id] || s.label}
        </button>
      ))}
    </div>
  )
}
