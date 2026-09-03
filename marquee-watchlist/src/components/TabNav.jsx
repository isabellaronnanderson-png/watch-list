const TABS = [
  { id: 'watch', label: 'Watch', accent: '31, 63, 191' },
  { id: 'read', label: 'Read', accent: '242, 196, 0' },
  { id: 'articles', label: 'Articles', accent: '63, 174, 73' },
  { id: 'listen', label: 'Listen', accent: '78, 195, 224' },
  { id: 'games', label: 'Play', accent: '139, 47, 201' },
  { id: 'watchlater', label: 'YouTube', accent: '229, 52, 42' },
]

export default function TabNav({ active, onChange }) {
  return (
    <nav className="masthead">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`masthead-link${active === t.id ? ' is-active' : ''}`}
          style={{ '--btn-accent-rgb': t.accent, '--btn-accent': `rgb(${t.accent})` }}
          onClick={() => onChange(t.id)}
          aria-current={active === t.id ? 'page' : undefined}
        >
          {t.label}
        </button>
      ))}
    </nav>
  )
}
