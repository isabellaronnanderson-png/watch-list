export default function HeroBanner({ title }) {
  return (
    <div className="hero-banner">
      <div className="hero-banner-shelf" aria-hidden="true" />
      <div className="hero-banner-title-card">
        <h1>{title}</h1>
      </div>
    </div>
  )
}
