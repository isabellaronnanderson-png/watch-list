import { useState } from 'react'
import PickForMe from './PickForMe'

export default function MobileFilterToggle({ children, pickItems }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="filters-bar-row">
        <button type="button" className="mobile-filters-toggle" onClick={() => setOpen((v) => !v)}>
          Filters {open ? '▲' : '▼'}
        </button>
        {pickItems && <PickForMe items={pickItems} />}
      </div>
      <div className={`filter-window${open ? ' is-open-mobile' : ''}`}>{children}</div>
    </>
  )
}
