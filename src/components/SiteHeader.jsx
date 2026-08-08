const BAR_COLORS = ['#1f3fbf', '#f2c400', '#3fae49', '#4ec3e0', '#8b2fc9', '#e5342a']

export default function SiteHeader() {
  return (
    <div>
      <div className="site-header">
        <svg className="site-logo" viewBox="0 0 32 32" aria-hidden="true">
          <rect x="2" y="8" width="28" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="2" cy="16" r="3" fill="#fff" stroke="currentColor" strokeWidth="2" />
          <circle cx="30" cy="16" r="3" fill="#fff" stroke="currentColor" strokeWidth="2" />
          <line x1="21" y1="9" x2="21" y2="23" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2,2" />
        </svg>
        <h1 className="site-title">Ultimate Media List</h1>
      </div>
      <div className="color-bar" aria-hidden="true">
        {BAR_COLORS.map((c) => (
          <span key={c} style={{ background: c }} />
        ))}
      </div>
    </div>
  )
}
