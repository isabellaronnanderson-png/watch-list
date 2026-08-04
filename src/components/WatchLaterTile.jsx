import { WATCH_STATUSES, ticketNumber } from '../utils/format'
import StatusStub from './StatusStub'
import TagMenu from './TagMenu'

const LABELS = { want: 'Want', watching: 'Watching', watched: 'Watched' }

export default function WatchLaterTile({ item, onSetStatus, onRemove, onToggleTag, allTags }) {
  const tags = item.tags || []

  return (
    <article className={`media-card${item.status === 'watched' ? ' is-done' : ''}`}>
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
        <img src={item.thumbnail} alt="" />
        <span className="media-card-play">▶</span>
      </a>

      <div className="media-card-perforation" />

      <div className="media-card-body">
        <span className="media-card-kind">YouTube</span>
        <h3 className="media-card-title">{item.title}</h3>
        {item.channel && <p className="media-card-sub">{item.channel}</p>}
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
          statuses={WATCH_STATUSES}
          status={item.status}
          onSetStatus={(s) => onSetStatus(item.id, s)}
          labels={LABELS}
        />
      </div>
    </article>
  )
}
