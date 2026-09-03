// Creates toggle/rename/delete tag actions bound to a given setItems updater.
// Used by every tab's list hook so the tag logic isn't duplicated five times.
export function makeTagActions(setItems) {
  function toggleTag(id, tag) {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const has = p.tags?.includes(tag)
        const tags = has ? p.tags.filter((t) => t !== tag) : [...(p.tags || []), tag]
        return { ...p, tags }
      })
    )
  }

  function renameTag(oldName, newName) {
    setItems((prev) =>
      prev.map((p) => {
        if (!p.tags?.includes(oldName)) return p
        const tags = Array.from(new Set(p.tags.map((t) => (t === oldName ? newName : t))))
        return { ...p, tags }
      })
    )
  }

  function deleteTag(name) {
    setItems((prev) =>
      prev.map((p) => {
        if (!p.tags?.includes(name)) return p
        return { ...p, tags: p.tags.filter((t) => t !== name) }
      })
    )
  }

  return { toggleTag, renameTag, deleteTag }
}
