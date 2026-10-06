import { useEffect, useRef } from 'react'
import { scrollToItem } from '../utils/scrollToItem'
import { setPick, clearPick, usePickedId } from '../utils/pickStore'

// Picks a random item from whatever the current filters leave visible. The
// choice is spotlighted (everything else dims) until it's started or dismissed.
export default function PickForMe({ items }) {
  const pickedId = usePickedId()
  const lastRef = useRef(null)

  // Leaving the tab shouldn't leave a stale spotlight behind.
  useEffect(() => () => clearPick(), [])

  useEffect(() => {
    document.body.classList.toggle('has-pick', Boolean(pickedId))
    return () => document.body.classList.remove('has-pick')
  }, [pickedId])

  function pick() {
    if (items.length === 0) return
    // Avoid handing back the same item twice in a row when there's a choice.
    const pool = items.length > 1 ? items.filter((i) => i.id !== lastRef.current) : items
    const choice = pool[Math.floor(Math.random() * pool.length)]
    lastRef.current = choice.id
    setPick(choice.id)

    const el = document.getElementById(choice.id)
    const toggle = el?.querySelector('.mobile-expand-toggle')
    if (
      toggle &&
      !el.classList.contains('is-expanded') &&
      getComputedStyle(toggle).display !== 'none'
    ) {
      toggle.click()
    }

    // Wait a couple of frames so any expansion has settled before scrolling.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToItem(choice.id))
    })
  }

  return (
    <button
      type="button"
      className="pick-btn"
      onClick={pick}
      disabled={items.length === 0}
      title={items.length === 0 ? 'Nothing matches your filters' : undefined}
    >
      {pickedId ? 'Pick again' : 'Pick for me'}
    </button>
  )
}
