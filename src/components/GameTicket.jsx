import { useState } from 'react'
import { usePickedId } from '../utils/pickStore'
import PickPrompt from './PickPrompt'
import { GAME_STATUSES, ticketNumber } from '../utils/format'
import StatusStub from './StatusStub'
import TagMenu from './TagMenu'
import StarRating from './StarRating'
import InlineRatingPrompt from './InlineRatingPrompt'

const LABELS = { want: 'Want', playing: 'Playing', played: 'Played' }
const MODE_LABELS = { singleplayer: 'Singleplayer', multiplayer: 'Multiplayer' }

export default function GameTicket({
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
      className={`media-card${item.status === 'played' && dimDone ? ' is-done' : ''}${expanded ? ' is-expanded' : ''}${isPicked ? ' is-picked' : ''}`}
    >
      <button
        className="media-card-remove media-card-remove-left"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title} from games list`}
        title="Remove"
      >
        ×
      </button>

      <TagMenu tags={tags} allTags={allTags} onToggleTag={(tag) => onToggleTag(item.id, tag)} />

      <div className="media-card-cover media-card-cover-wide">
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
        <div className="media-card-meta-row">
          <span className="media-card-kind">Game</span>
          {item.year && <span className="media-card-year">{item.year}</span>}
        </div>
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
            startStatus="playing"
            startLabel="Start playing"
            onSetStatus={onSetStatus}
          />
        )}
        <div className="media-card-detail">
          {item.platforms?.length > 0 && (
            <p className="media-card-sub">{item.platforms.slice(0, 3).join(' · ')}</p>
          )}
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
          <div className="media-card-providers">
            {item.modes?.length > 0 ? (
              item.modes.map((m) => (
                <span key={m} className="provider-stamp">
                  {MODE_LABELS[m] || m}
                </span>
              ))
            ) : (
              <span className="media-card-providers-empty">Mode unknown</span>
            )}
          </div>
          <span className="media-card-runtime">
            {item.playtimeHours ? `~${item.playtimeHours}H` : '— H'}
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
              statuses={GAME_STATUSES}
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
