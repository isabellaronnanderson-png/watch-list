import { coverUrl as openLibraryCoverUrl } from '../api/openLibrary'
import { LISTEN_STATUSES, ticketNumber } from '../utils/format'
import StatusStub from './StatusStub'

const LABELS = { want: 'Want', listening: 'Listening', listened: 'Listened' }

export default function ListenTile({ item, onSetStatus, onRemove }) {
  const isAudiobook = item.kind === 'audiobook'
  const cover = isAudiobook
    ? item.coverUrl || (item.coverId ? openLibraryCoverUrl(item.coverId, 'M') : null)
    : null

  return (
    <article className={`media-card${item.status === 'listened' ? ' is-done' : ''}`}>
      <button
        className="media-card-remove"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title}`}
        title="Remove"
      >
        ×
      </button>

      <div className="media-card-cover">
        {cover ? (
          <img src={cover} alt="" />
        ) : (
          <div className="media-card-cover-empty media-card-cover-fallback">
            <span>{item.title}</span>
          </div>
        )}
      </div>

      <div className="media-card-perforation" />

      <div className="media-card-body">
        <span className="media-card-kind">{isAudiobook ? 'Audiobook' : 'Manual'}</span>
        <h3 className="media-card-title">{item.title}</h3>
        {isAudiobook ? (
          <p className="media-card-sub">{item.author}</p>
        ) : (
          item.subtitle && <p className="media-card-sub">{item.subtitle}</p>
        )}
        <div className="media-card-barcode" />
        <span className="media-card-ticket-no">Admit One · No. {ticketNumber(item.id)}</span>
        <StatusStub
          statuses={LISTEN_STATUSES}
          status={item.status}
          onSetStatus={(s) => onSetStatus(item.id, s)}
          labels={LABELS}
        />
      </div>
    </article>
  )
}
