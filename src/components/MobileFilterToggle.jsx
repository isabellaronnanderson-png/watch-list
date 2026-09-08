import { useState } from 'react'

export default function MobileFilterToggle({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className="mobile-filters-toggle" onClick={() => setOpen((v) => !v)}>
        Filters {open ? '▲' : '▼'}
      </button>
      <div className={`filter-window${open ? ' is-open-mobile' : ''}`}>{children}</div>
    </>
  )
}
