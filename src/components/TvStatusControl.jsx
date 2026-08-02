import { useEffect, useRef, useState } from 'react'

export default function TvStatusControl({ status, seasons, onSetStatus, onToggleSeason }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="tv-status-control" ref={ref}>
      <div className="stub-status">
        <button
          className={`stub-status-btn status-want${status === 'want' ? ' is-active' : ''}`}
          onClick={() => {
            setOpen(false)
            onSetStatus('want')
          }}
        >
          Want
        </button>
        <button
          className={`stub-status-btn status-watching${status === 'watching' ? ' is-active' : ''}`}
          onClick={() => {
            setOpen(false)
            onSetStatus('watching')
          }}
        >
          Watching
        </button>
        <button
          className={`stub-status-btn status-watched${status === 'watched' ? ' is-active' : ''}`}
          onClick={() => setOpen((v) => !v)}
        >
          Watched
        </button>
      </div>
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
    </div>
  )
}
