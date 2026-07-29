const SPINE_WIDTHS = [16, 10, 22, 8, 14, 26, 12, 18, 9, 20, 7, 15, 24, 11, 17, 13, 21, 9, 16, 12]
const VARIANTS = ['spineA', 'spineB', 'spineC']

function buildSpines(y, h) {
  const spines = []
  let x = 0
  let i = 0
  while (x < 1400) {
    const w = SPINE_WIDTHS[i % SPINE_WIDTHS.length]
    spines.push({ x, w, y, h, variant: VARIANTS[i % VARIANTS.length] })
    x += w
    i++
  }
  return spines
}

const ROWS = [
  { y: 2, h: 52 },
  { y: 66, h: 52 },
  { y: 130, h: 52 },
]

export default function HeroBanner({ title }) {
  return (
    <div className="hero-banner">
      <svg
        className="hero-banner-shelf"
        viewBox="0 0 1400 200"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="spineA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#404040" />
            <stop offset="45%" stopColor="#121212" />
            <stop offset="55%" stopColor="#050505" />
            <stop offset="100%" stopColor="#2c2c2c" />
          </linearGradient>
          <linearGradient id="spineB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#606060" />
            <stop offset="45%" stopColor="#2b2b2b" />
            <stop offset="55%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#484848" />
          </linearGradient>
          <linearGradient id="spineC" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7d7d7d" />
            <stop offset="45%" stopColor="#404040" />
            <stop offset="55%" stopColor="#2e2e2e" />
            <stop offset="100%" stopColor="#606060" />
          </linearGradient>
          <linearGradient id="ledge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8f8f8f" />
            <stop offset="100%" stopColor="#3f3f3f" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1400" height="200" fill="#161616" />

        {ROWS.map((row, ri) => (
          <g key={ri}>
            {buildSpines(row.y, row.h).map((s, i) => (
              <rect
                key={i}
                x={s.x}
                y={s.y}
                width={Math.max(s.w - 1, 1)}
                height={s.h}
                fill={`url(#${s.variant})`}
              />
            ))}
            <rect x="0" y={row.y + row.h} width="1400" height="5" fill="url(#ledge)" />
            <rect x="0" y={row.y + row.h + 5} width="1400" height="4" fill="#000000" opacity="0.35" />
          </g>
        ))}
      </svg>

      <div className="hero-banner-title-card">
        <h1>{title}</h1>
      </div>
    </div>
  )
}
