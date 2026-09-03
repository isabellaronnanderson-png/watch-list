import { useEffect, useState } from 'react'
import { subscribeRatingPrompt } from '../utils/ratingPromptStore'
import StarRating from './StarRating'

export default function RatingPromptToast() {
  const [prompt, setPrompt] = useState(null)

  useEffect(() => {
    return subscribeRatingPrompt((data) => setPrompt(data))
  }, [])

  useEffect(() => {
    if (!prompt) return
    const timer = setTimeout(() => setPrompt(null), 6000)
    return () => clearTimeout(timer)
  }, [prompt])

  if (!prompt) return null

  const left = Math.min(Math.max(prompt.x - 90, 12), window.innerWidth - 192)
  const top = Math.min(prompt.y + 14, window.innerHeight - 90)

  return (
    <div className="rating-prompt" style={{ left, top }}>
      <span>Rate it?</span>
      <StarRating
        rating={prompt.rating}
        onSetRating={(r) => {
          prompt.onSetRating(r)
          setPrompt(null)
        }}
      />
      <button className="rating-prompt-close" onClick={() => setPrompt(null)} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}
