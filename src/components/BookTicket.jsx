import { coverUrl } from '../api/openLibrary'
import { formatPages } from '../utils/format'

export default function BookTicket({ item, onToggleRead, onRemove }) {
  return (
    <article className={`ticket${item.read ? ' is-watched' : ''}`}>
      <button
        className="ticket-remove"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title} from reading list`}
        title="Remove"
      >
        ×
      </button>

      <div className="ticket-main">
        {item.coverId ? (
          <img className="ticket-poster" src={coverUrl(item.coverId, 'M')} alt="" />
        ) : (
          <div className="ticket-poster" />
        )}
        <div className="ticket-body">
          <span className="ticket-kind">Book</span>
          <h3 className="ticket-title">{item.title}</h3>
          <span className="ticket-year">
            {item.author}
            {item.year ? ` · ${item.year}` : ''}
          </span>
          {item.genres?.length > 0 && (
            <span className="ticket-genres">{item.genres.slice(0, 3).join(' · ')}</span>
          )}
        </div>
      </div>

      <div className="ticket-divider" />

      <div className="ticket-stub">
        <span className="stub-admit">Library&nbsp;Card</span>
        <span className="stub-runtime">{formatPages(item.pageCount)}</span>
        <button className="stub-watch-btn" onClick={() => onToggleRead(item.id)}>
          {item.read ? 'Unread' : 'Read'}
        </button>
      </div>
    </article>
  )
}
