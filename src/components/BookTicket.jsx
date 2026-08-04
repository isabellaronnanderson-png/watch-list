import { coverUrl as openLibraryCoverUrl } from '../api/openLibrary'
import { formatPages, READ_STATUSES, ticketNumber } from '../utils/format'
import StatusStub from './StatusStub'
import TagMenu from './TagMenu'

const LABELS = { want: 'Want', reading: 'Reading', read: 'Read' }

export default function BookTicket({ item, onSetStatus, onRemove, onToggleTag, allTags }) {
  const cover = item.coverUrl || (item.coverId ? openLibraryCoverUrl(item.coverId, 'M') : null)
  const tags = item.tags || []

  return (
    <article className={`media-card media-card-h${item.status === 'read' ? ' is-done' : ''}`}>
      <button
        className="media-card-remove media-card-remove-left"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title} from reading list`}
        title="Remove"
      >
        ×
      </button>

      <TagMenu tags={tags} allTags={allTags} onToggleTag={(tag) => onToggleTag(item.id, tag)} />

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
        {tags.length > 0 && (
          <div className="media-card-tags">
            {tags.map((t) => (
              <span key={t} className="tag-chip">
                {t === 'Favorite' ? '★ Favorite' : t}
              </span>
            ))}
          </div>
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
