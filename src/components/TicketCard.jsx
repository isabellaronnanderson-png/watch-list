import { posterUrl } from '../api/tmdb'
import { formatRuntime } from '../utils/format'
import { providerLabel } from '../utils/providers'

function SeasonTracker({ seasons, onToggleSeason }) {
  const watchedCount = seasons.filter(Boolean).length
  return (
    <div className="stub-seasons">
      <span className="stub-seasons-count">
        {watchedCount}/{seasons.length}
      </span>
      <div className="stub-seasons-list">
        {seasons.map((watched, i) => (
          <button
            key={i}
            className={`stub-season-chip${watched ? ' is-watched' : ''}`}
            onClick={() => onToggleSeason(i)}
            title={`Season ${i + 1}${watched ? ' — watched' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function TicketCard({ item, onToggleWatched, onToggleSeason, onRemove }) {
  const isTv = item.mediaType === 'tv' && Array.isArray(item.seasons) && item.seasons.length > 0

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
        {isTv ? (
          <SeasonTracker
            seasons={item.seasons}
            onToggleSeason={(seasonIndex) => onToggleSeason(item.id, seasonIndex)}
          />
        ) : (
          <button className="stub-watch-btn" onClick={() => onToggleWatched(item.id)}>
            {item.watched ? 'Unwatch' : 'Watched'}
          </button>
        )}
      </div>
    </article>
  )
}
