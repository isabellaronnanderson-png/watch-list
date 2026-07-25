const TABS = [
  { id: 'watch', label: 'Watch' },
  { id: 'read', label: 'Read' },
  { id: 'listen', label: 'Listen' },
]

export default function TabNav({ active, onChange }) {
  return (
    <nav className="tab-nav">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`tab-btn${active === t.id ? ' is-active' : ''}`}
          onClick={() => onChange(t.id)}
          aria-current={active === t.id ? 'page' : undefined}
        >
          {t.label}
        </button>
      ))}
    </nav>
  )
}
