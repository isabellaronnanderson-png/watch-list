import { posterUrl, providerLogoUrl } from '../api/tmdb'
import { formatRuntime } from '../utils/format'

export default function TicketCard({ item, onToggleWatched, onRemove }) {
  const streamProviders = item.providers?.filter((p) => p.kind === 'stream') || []

  return (
    <article className={`ticket${item.watched ? ' is-watched' : ''}`}>
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
            {streamProviders.length > 0 ? (
              streamProviders
                .slice(0, 4)
                .map((p) => (
                  <img
                    key={p.id}
                    src={providerLogoUrl(p.logoPath)}
                    alt={p.name}
                    title={p.name}
                  />
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
        <button className="stub-watch-btn" onClick={() => onToggleWatched(item.id)}>
          {item.watched ? 'Unwatch' : 'Watched'}
        </button>
      </div>
    </article>
  )
}
