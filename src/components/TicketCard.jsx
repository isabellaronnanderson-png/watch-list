import { posterUrl } from '../api/tmdb'
import { formatRuntime, WATCH_STATUSES } from '../utils/format'
import { providerLabel } from '../utils/providers'
import StatusStub from './StatusStub'

const LABELS = { want: 'Want', watching: 'Watching', watched: 'Watched' }

export default function TicketCard({ item, onSetStatus, onRemove }) {
  return (
    <article className={`media-card${item.status === 'watched' ? ' is-done' : ''}`}>
      <button
        className="media-card-remove"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title} from watchlist`}
        title="Remove"
      >
        ×
      </button>

      <div className="media-card-cover">
        {item.posterPath ? (
          <img src={posterUrl(item.posterPath, 'w342')} alt="" />
        ) : (
          <div className="media-card-cover-empty" />
        )}
      </div>

      <div className="media-card-body">
        <div className="media-card-meta-row">
          <span className="media-card-kind">{item.mediaType === 'tv' ? 'Series' : 'Feature'}</span>
          {item.year && <span className="media-card-year">{item.year}</span>}
        </div>
        <h3 className="media-card-title">{item.title}</h3>
        {item.genres?.length > 0 && (
          <p className="media-card-sub">{item.genres.slice(0, 3).join(' · ')}</p>
        )}
        <div className="media-card-providers">
          {item.providerIds?.length > 0 ? (
            item.providerIds.map((pid) => (
              <span key={pid} className="provider-stamp">
                {providerLabel(pid)}
              </span>
            ))
          ) : (
            <span className="media-card-providers-empty">Not streaming</span>
          )}
        </div>
        <span className="media-card-runtime">{formatRuntime(item.runtimeMinutes)}</span>
        <StatusStub
          statuses={WATCH_STATUSES}
          status={item.status}
          onSetStatus={(s) => onSetStatus(item.id, s)}
          labels={LABELS}
        />
      </div>
    </article>
  )
}
