import { useState } from 'react'
import TagManager from './TagManager'

export default function TagFilterGroup({ allTags, selectedTags, onToggleTag, onRenameTag, onDeleteTag }) {
  const [managing, setManaging] = useState(false)

  return (
    <div className="filter-group">
      <div className="filter-group-label-row">
        <span className="filter-group-label">Tags</span>
        {allTags.length > 0 && (
          <button className="filter-manage-link" onClick={() => setManaging(true)}>
            Manage
          </button>
        )}
      </div>
      <div className="chip-row">
        {allTags.length === 0 && <span className="filter-hint">Tag an item to see it here</span>}
        {allTags.map((t) => (
          <button
            key={t}
            className="chip"
            aria-pressed={selectedTags.has(t)}
            onClick={() => onToggleTag(t)}
          >
            {t === 'Favorite' ? '★ Favorite' : t}
          </button>
        ))}
      </div>
      {managing && (
        <TagManager
          tags={allTags}
          onRename={onRenameTag}
          onDelete={onDeleteTag}
          onClose={() => setManaging(false)}
        />
      )}
    </div>
  )
}
