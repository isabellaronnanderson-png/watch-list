import { useState } from 'react'
import { usePickedId } from '../utils/pickStore'
import PickPrompt from './PickPrompt'
import { LISTEN_STATUSES, ticketNumber } from '../utils/format'
import StatusStub from './StatusStub'
import TagMenu from './TagMenu'
import StarRating from './StarRating'
import InlineRatingPrompt from './InlineRatingPrompt'

const LABELS = { want: 'Want', listening: 'Listening', listened: 'Listened' }

export default function AlbumTicket({
  item,
  onSetStatus,
  onRemove,
  onToggleTag,
  onSetRating,
  onSkipRating,
  allTags,
  dimDone = true,
  isPendingRating = false,
}) {
  const [expanded, setExpanded] = useState(false)
  const isPicked = usePickedId() === item.id
  const tags = item.tags || []

  return (
    <article
      id={item.id}
      className={`media-card media-card-h${item.status === 'listened' && dimDone ? ' is-done' : ''}${expanded ? ' is-expanded' : ''}${isPicked ? ' is-picked' : ''}${isPendingRating ? ' is-rating' : ''}`}
    >
      <button
        className="media-card-remove media-card-remove-left"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title} from albums`}
        title="Remove"
      >
        ×
      </button>

      <TagMenu tags={tags} allTags={allTags} onToggleTag={(tag) => onToggleTag(item.id, tag)} />

      <div className="media-card-cover media-card-cover-square">
        {item.coverUrl ? (
          <img src={item.coverUrl} alt="" />
        ) : (
          <div className="media-card-cover-empty media-card-cover-fallback">
            <span>{item.title}</span>
          </div>
        )}
      </div>

      <div className="media-card-perforation" />

      <div className="media-card-body">
        <span className="media-card-kind">Album</span>
        <div className="media-card-title-row">
          <h3 className="media-card-title">{item.title}</h3>
          <span className="mobile-status-pill">{LABELS[item.status] || item.status}</span>
          <button
            type="button"
            className="mobile-expand-toggle"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Show less' : 'Show more'}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
        {isPicked && (
          <PickPrompt
            item={item}
            startStatus="listening"
            startLabel="Start listening"
            onSetStatus={onSetStatus}
          />
        )}
        <div className="media-card-detail">
          <p className="media-card-sub">{item.artist}</p>
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
          <span className="media-card-runtime">
            {item.trackCount ? `${item.trackCount} tracks` : '— tracks'}
          </span>
          {!isPendingRating && (
            <StarRating rating={item.rating} onSetRating={(r) => onSetRating(item.id, r)} />
          )}
          <div className="media-card-barcode" />
          <span className="media-card-ticket-no">Admit One · No. {ticketNumber(item.id)}</span>
          {isPendingRating ? (
            <InlineRatingPrompt
              rating={item.rating}
              onSetRating={(r) => onSetRating(item.id, r)}
              onSkip={() => onSkipRating(item.id)}
            />
          ) : (
            <StatusStub
              statuses={LISTEN_STATUSES}
              status={item.status}
              onSetStatus={(s) => onSetStatus(item.id, s)}
              labels={LABELS}
            />
          )}
        </div>
      </div>
    </article>
  )
}
