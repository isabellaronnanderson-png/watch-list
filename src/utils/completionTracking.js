// Auto-clears a "just completed" flag a little after the rating prompt would
// have closed on its own (it times out after 6s), so a skipped/ignored item
// settles back into the normal hidden-when-done behavior instead of staying
// visible forever until the page reloads.
export function scheduleAutoClear(setJustCompletedIds, id, delay = 6500) {
  setTimeout(() => {
    setJustCompletedIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, delay)
}
