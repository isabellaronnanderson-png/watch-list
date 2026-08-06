import { READ_STATUSES, ticketNumber } from '../utils/format'
import StatusStub from './StatusStub'
import TagMenu from './TagMenu'

const LABELS = { want: 'Want', reading: 'Reading', read: 'Read' }

export default function ArticleTile({ item, onSetStatus, onRemove, onToggleTag, allTags, dimDone = true }) {
  const tags = item.tags || []

  return (
    <article className={`media-card${item.status === 'read' && dimDone ? ' is-done' : ''}`}>
      <button
        className="media-card-remove media-card-remove-left"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title}`}
        title="Remove"
      >
        ×
      </button>

      <TagMenu tags={tags} allTags={allTags} onToggleTag={(tag) => onToggleTag(item.id, tag)} />

      <a className="media-card-cover media-card-cover-wide" href={item.url} target="_blank" rel="noreferrer">
        {item.image ? (
          <img src={item.image} alt="" />
        ) : (
          <div className="media-card-cover-empty media-card-cover-fallback">
            <span>{item.title}</span>
          </div>
        )}
      </a>

      <div className="media-card-perforation" />

      <div className="media-card-body">
        <span className="media-card-kind">Article</span>
        <h3 className="media-card-title">{item.title}</h3>
        {item.publisher && <p className="media-card-sub">{item.publisher}</p>}
        {tags.length > 0 && (
          <div className="media-card-tags">
            {tags.map((t) => (
              <span key={t} className="tag-chip">
                {t === 'Favorite' ? '★ Favorite' : t}
              </span>
            ))}
          </div>
        )}
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
