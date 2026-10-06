import { useState } from 'react'
import { scrollToItem } from '../utils/scrollToItem'

// Picks a random item from whatever the current filters leave visible, then
// scrolls to it with the usual flash highlight. On mobile the card is also
// expanded so its controls are right there.
export default function PickForMe({ items }) {
  const [pickedId, setPickedId] = useState(null)

  function pick() {
    if (items.length === 0) return
    // Avoid handing back the same item twice in a row when there's a choice.
    const pool = items.length > 1 ? items.filter((i) => i.id !== pickedId) : items
    const choice = pool[Math.floor(Math.random() * pool.length)]
    setPickedId(choice.id)

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
