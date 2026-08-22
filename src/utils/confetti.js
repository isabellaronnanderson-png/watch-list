const COLORS = ['#e5342a', '#c9a400', '#3fae49', '#4ec3e0', '#8b2fc9', '#1f3fbf']

export function burstConfetti(x, y) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const count = 14
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div')
    piece.className = 'confetti-piece'
    piece.style.background = COLORS[i % COLORS.length]
    piece.style.left = `${x}px`
    piece.style.top = `${y}px`

    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3
    const dist = 50 + Math.random() * 40
    piece.style.setProperty('--tx', `${Math.cos(angle) * dist}px`)
    piece.style.setProperty('--ty', `${Math.sin(angle) * dist - 20}px`)
    piece.style.setProperty('--tr', `${Math.random() * 360}deg`)

    document.body.appendChild(piece)
    requestAnimationFrame(() => piece.classList.add('go'))
    setTimeout(() => piece.remove(), 800)
  }
}
