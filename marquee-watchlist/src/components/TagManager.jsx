import { useState } from 'react'

export default function TagManager({ tags, onRename, onDelete, onClose }) {
  const [edits, setEdits] = useState({})

  function commitRename(tag) {
    const newName = (edits[tag] ?? tag).trim()
    if (newName && newName !== tag) onRename(tag, newName)
  }

  return (
    <div className="tag-manager-overlay" onClick={onClose}>
      <div className="tag-manager" onClick={(e) => e.stopPropagation()}>
        <div className="tag-manager-header">
          <span>Manage tags</span>
          <button onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {tags.length === 0 && <p className="filter-hint">No tags yet.</p>}
        {tags.map((tag) => {
          const isFavorite = tag === 'Favorite'
          return (
            <div key={tag} className="tag-manager-row">
              <input
                type="text"
                value={edits[tag] ?? tag}
                onChange={(e) => setEdits((prev) => ({ ...prev, [tag]: e.target.value }))}
                onBlur={() => !isFavorite && commitRename(tag)}
                onKeyDown={(e) => e.key === 'Enter' && !isFavorite && commitRename(tag)}
                disabled={isFavorite}
              />
              {!isFavorite && (
                <button
                  className="tag-manager-delete"
                  onClick={() => onDelete(tag)}
                  aria-label={`Delete tag ${tag}`}
                  title="Delete tag"
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
