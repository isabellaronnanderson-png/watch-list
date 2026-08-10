export function scrollToItem(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.classList.add('flash-highlight')
  setTimeout(() => el.classList.remove('flash-highlight'), 1400)
}

// Closes an open search-results panel first, then waits a couple of frames for
// the resulting layout shift to settle before scrolling - otherwise the target
// moves out from under the scroll as the panel collapses, overshooting it.
export function closeAndScrollToItem(closeFn, id) {
  closeFn()
  requestAnimationFrame(() => {
    requestAnimationFrame(() => scrollToItem(id))
  })
}
