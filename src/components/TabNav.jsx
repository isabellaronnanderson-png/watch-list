const TABS = [
  { id: 'watch', label: 'Watch' },
  { id: 'read', label: 'Read' },
  { id: 'listen', label: 'Listen' },
  { id: 'games', label: 'Play' },
  { id: 'watchlater', label: 'YouTube' },
]

export default function TabNav({ active, onChange }) {
  return (
    <nav className="masthead">
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
  )
}
