import { coverUrl } from '../api/openLibrary'
import { formatPages, READ_STATUSES } from '../utils/format'
import StatusStub from './StatusStub'

const LABELS = { want: 'Want', reading: 'Reading', read: 'Read' }

export default function BookTicket({ item, onSetStatus, onRemove }) {
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
        {item.coverId ? (
          <img
            src={coverUrl(item.coverId, 'M')}
            alt=""
            style={{ objectPosition: 'center 15%' }}
          />
        ) : (
          <div className="media-card-cover-empty" />
        )}
      </div>

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
