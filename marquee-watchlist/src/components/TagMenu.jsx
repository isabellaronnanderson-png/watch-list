import { useEffect, useRef, useState } from 'react'

export default function TagMenu({ tags, allTags, onToggleTag }) {
  const [open, setOpen] = useState(false)
  const [newTag, setNewTag] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const otherTags = allTags.filter((t) => t !== 'Favorite')

  function handleAddTag(e) {
    e.preventDefault()
    const trimmed = newTag.trim()
    if (!trimmed) return
    onToggleTag(trimmed)
    setNewTag('')
  }

  return (
    <div className="tag-menu" ref={ref}>
      <button
        type="button"
        className={`media-card-tag-btn${tags.includes('Favorite') ? ' is-active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Tags"
        title="Tags"
      >
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path
            d="M2.5 11.5V4a1.5 1.5 0 0 1 1.5-1.5h7.5L21.5 12 12.5 21 2.5 11.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="7" r="1.4" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div className="tag-dropdown">
          <label className="tag-dropdown-row">
            <input
              type="checkbox"
              checked={tags.includes('Favorite')}
              onChange={() => onToggleTag('Favorite')}
            />
            ★ Favorite
          </label>
          {otherTags.map((t) => (
            <label key={t} className="tag-dropdown-row">
              <input type="checkbox" checked={tags.includes(t)} onChange={() => onToggleTag(t)} />
              {t}
            </label>
          ))}
          <form className="tag-add-form" onSubmit={handleAddTag}>
            <input
              type="text"
              placeholder="New tag…"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
            <button type="submit">Add</button>
          </form>
        </div>
      )}
    </div>
  )
}
