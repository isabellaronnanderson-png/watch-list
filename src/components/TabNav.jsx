const TABS = [
  { id: 'watch', label: 'Watch' },
  { id: 'read', label: 'Read' },
  { id: 'listen', label: 'Listen' },
  { id: 'watchlater', label: 'Watch Later' },
]

export default function TabNav({ active, onChange }) {
  return (
    <header className="masthead">
      <div className="masthead-brand">
        <svg className="masthead-mark" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="20" cy="20" r="5" fill="currentColor" />
          <line x1="20" y1="2" x2="20" y2="9" stroke="currentColor" strokeWidth="2.5" />
          <line x1="20" y1="31" x2="20" y2="38" stroke="currentColor" strokeWidth="2.5" />
          <line x1="2" y1="20" x2="9" y2="20" stroke="currentColor" strokeWidth="2.5" />
          <line x1="31" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="2.5" />
        </svg>
        <span className="masthead-wordmark">The Reel Ledger</span>
      </div>
      <nav className="masthead-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`masthead-link${active === t.id ? ' is-active' : ''}`}
            onClick={() => onChange(t.id)}
            aria-current={active === t.id ? 'page' : undefined}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
