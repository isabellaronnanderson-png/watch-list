import { coverUrl } from '../api/openLibrary'

export default function ListenTile({ item, onToggleListened, onRemove }) {
  const isAudiobook = item.kind === 'audiobook'
  const cover = isAudiobook ? coverUrl(item.coverId, 'L') : null

  return (
    <div className={`listen-tile${item.listened ? ' is-listened' : ''}`}>
      {cover ? (
        <img src={cover} alt="" />
      ) : (
        <div className="listen-tile-fallback">
          <span>{item.title}</span>
        </div>
      )}

      <span className="listen-tile-kind">{isAudiobook ? 'Audiobook' : 'Manual'}</span>

      <button
        className="ticket-remove listen-tile-remove"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title}`}
        title="Remove"
      >
        ×
      </button>

      <button
        className={`listen-tile-toggle${item.listened ? ' is-listened' : ''}`}
        onClick={() => onToggleListened(item.id)}
        title={item.listened ? 'Mark unlistened' : 'Mark listened'}
      >
        ✓
      </button>

      <div className="listen-tile-info">
        <div className="listen-tile-title">{item.title}</div>
        {isAudiobook ? (
          <div className="listen-tile-author">{item.author}</div>
        ) : (
          item.subtitle && <div className="listen-tile-author">{item.subtitle}</div>
        )}
      </div>
    </div>
  )
}
