import { useEffect, useRef, useState } from 'react'
import { burstConfetti } from '../utils/confetti'
import { showRatingPrompt } from '../utils/ratingPromptStore'

export default function TvStatusControl({ status, seasons, onSetStatus, onToggleSeason, rating, onSetRating }) {
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
              <input
                type="checkbox"
                checked={watched}
                onChange={(e) => {
                  const willComplete = !watched && seasons.every((s, idx) => (idx === i ? true : s))
                  if (willComplete) {
                    const rect = e.target.getBoundingClientRect()
                    const x = rect.left + rect.width / 2
                    const y = rect.top + rect.height / 2
                    burstConfetti(x, y)
                    if (onSetRating) showRatingPrompt({ x, y, rating, onSetRating })
                  }
                  onToggleSeason(i)
                }}
              />
              Season {i + 1}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
