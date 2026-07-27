export default function WatchLaterTile({ item, onToggleWatched, onRemove }) {
  return (
    <div className={`reel-tile${item.watched ? ' is-done' : ''}`}>
      <a className="reel-tile-thumb" href={item.url} target="_blank" rel="noreferrer">
        <img src={item.thumbnail} alt="" />
        <span className="reel-tile-play">▶</span>
      </a>

      <button
        className="ticket-remove reel-tile-remove"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title}`}
        title="Remove"
      >
        ×
      </button>

      <div className="reel-tile-info">
        <h3 className="reel-tile-title">{item.title}</h3>
        {item.channel && <span className="reel-tile-channel">{item.channel}</span>}
      </div>

      <button
        className={`reel-tile-toggle${item.watched ? ' is-active' : ''}`}
        onClick={() => onToggleWatched(item.id)}
      >
        {item.watched ? 'Watched' : 'Mark watched'}
      </button>
    </div>
  )
}
