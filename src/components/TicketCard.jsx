import { posterUrl } from '../api/tmdb'
import { formatRuntime, WATCH_STATUSES } from '../utils/format'
import { providerLabel } from '../utils/providers'
import StatusStub from './StatusStub'

const LABELS = { want: 'Want', watching: 'Watching', watched: 'Watched' }

export default function TicketCard({ item, onSetStatus, onRemove }) {
  return (
    <article className={`ticket${item.status === 'watched' ? ' is-done' : ''}`}>
      <button
        className="ticket-remove"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title} from watchlist`}
        title="Remove"
      >
        ×
      </button>

      <div className="ticket-main">
        {item.posterPath ? (
          <img className="ticket-poster" src={posterUrl(item.posterPath, 'w154')} alt="" />
        ) : (
          <div className="ticket-poster" />
        )}
        <div className="ticket-body">
          <span className="ticket-kind">{item.mediaType === 'tv' ? 'Series' : 'Feature'}</span>
          <h3 className="ticket-title">{item.title}</h3>
          {item.year && <span className="ticket-year">{item.year}</span>}
          {item.genres?.length > 0 && (
            <span className="ticket-genres">{item.genres.slice(0, 3).join(' · ')}</span>
          )}
          <div className="ticket-providers">
            {item.providerIds?.length > 0 ? (
              item.providerIds.map((pid) => (
                <span key={pid} className="provider-stamp">
                  {providerLabel(pid)}
                </span>
              ))
            ) : (
              <span className="ticket-providers-empty">Not streaming</span>
            )}
          </div>
        </div>
      </div>

      <div className="ticket-divider" />

      <div className="ticket-stub">
        <span className="stub-admit">Admit&nbsp;One</span>
        <span className="stub-runtime">{formatRuntime(item.runtimeMinutes)}</span>
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
