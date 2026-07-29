import { coverUrl as openLibraryCoverUrl } from '../api/openLibrary'
import { formatPages, READ_STATUSES, ticketNumber } from '../utils/format'
import StatusStub from './StatusStub'

const LABELS = { want: 'Want', reading: 'Reading', read: 'Read' }

export default function BookTicket({ item, onSetStatus, onRemove }) {
  // New items store a direct coverUrl (Google Books); older saved items may still
  // have the previous Open Library coverId shape - fall back to that.
  const cover = item.coverUrl || (item.coverId ? openLibraryCoverUrl(item.coverId, 'M') : null)

  return (
    <article className={`media-card${item.status === 'read' ? ' is-done' : ''}`}>
      <button
        className="media-card-remove"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title} from reading list`}
        title="Remove"
      >
        ×
      </button>

      <div className="media-card-cover">
        {cover ? <img src={cover} alt="" /> : <div className="media-card-cover-empty" />}
      </div>

      <div className="media-card-perforation" />

      <div className="media-card-body">
        <div className="media-card-meta-row">
          <span className="media-card-kind">Book</span>
          {item.year && <span className="media-card-year">{item.year}</span>}
        </div>
        <h3 className="media-card-title">{item.title}</h3>
        <p className="media-card-sub">{item.author}</p>
        {item.genres?.length > 0 && (
          <p className="media-card-sub">{item.genres.slice(0, 3).join(' · ')}</p>
        )}
        <span className="media-card-runtime">{formatPages(item.pageCount)}</span>
        <div className="media-card-barcode" />
        <span className="media-card-ticket-no">Admit One · No. {ticketNumber(item.id)}</span>
        <StatusStub
          statuses={READ_STATUSES}
          status={item.status}
          onSetStatus={(s) => onSetStatus(item.id, s)}
          labels={LABELS}
        />
      </div>
    </article>
  )
}
