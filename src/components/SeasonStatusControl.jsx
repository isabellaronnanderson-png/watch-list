import { useEffect, useRef, useState } from 'react'

export default function SeasonStatusControl({ seasons, onToggleSeason, onSetStatus }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const watchedCount = seasons.filter(Boolean).length
  const total = seasons.length
  const pct = total > 0 ? Math.round((watchedCount / total) * 100) : 0
  const isFull = watchedCount === total
  const isEmpty = watchedCount === 0

  let label = 'Want'
  if (!isEmpty && !isFull) label = `${watchedCount}/${total} watched`
  if (isFull) label = 'Watched'

  return (
    <div className="season-control" ref={ref}>
      <button
        type="button"
        className={`season-pill${isFull ? ' is-full' : ''}`}
        style={{ '--fill-pct': `${pct}%` }}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </button>
      {open && (
        <div className="season-dropdown">
          {seasons.map((watched, i) => (
            <label key={i} className="season-dropdown-row">
              <input type="checkbox" checked={watched} onChange={() => onToggleSeason(i)} />
              Season {i + 1}
            </label>
          ))}
        </div>
      )}
      <button type="button" className="season-back-link" onClick={() => onSetStatus('want')}>
        ← Back to library
      </button>
    </div>
  )
}
