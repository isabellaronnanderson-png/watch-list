import { useState } from 'react'
import { posterUrl } from '../api/tmdb'
import { formatRuntime, WATCH_STATUSES, ticketNumber } from '../utils/format'
import { providerLabel } from '../utils/providers'
import StatusStub from './StatusStub'
import SeasonStatusControl from './SeasonStatusControl'
import TvStatusControl from './TvStatusControl'
import TagMenu from './TagMenu'
import StarRating from './StarRating'
import InlineRatingPrompt from './InlineRatingPrompt'

const LABELS = { want: 'Want', watching: 'Watching', watched: 'Watched' }

function mobileStatusSummary(item, isTv) {
  if (isTv) {
    const watchedCount = item.seasons.filter(Boolean).length
    const total = item.seasons.length
    if (watchedCount === 0) return 'Want'
    if (watchedCount === total) return 'Watched'
    return `${watchedCount}/${total}`
  }
  return LABELS[item.status] || item.status
}

export default function TicketCard({
  item,
  onSetStatus,
  onToggleSeason,
  onRemove,
  onToggleTag,
  onSetRating,
  onSkipRating,
  allTags,
  inWatchingSection,
  dimDone = true,
  isPendingRating = false,
}) {
  const [expanded, setExpanded] = useState(false)
  const isTv = item.mediaType === 'tv' && Array.isArray(item.seasons) && item.seasons.length > 0
  const tags = item.tags || []

  return (
    <article
      id={item.id}
      className={`media-card media-card-h${item.status === 'watched' && dimDone ? ' is-done' : ''}${expanded ? ' is-expanded' : ''}`}
    >
      <button
        className="media-card-remove media-card-remove-left"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title} from watchlist`}
        title="Remove"
      >
        ×
      </button>

      <TagMenu tags={tags} allTags={allTags} onToggleTag={(tag) => onToggleTag(item.id, tag)} />

      <div className="media-card-cover">
        {item.posterPath ? (
          <img src={posterUrl(item.posterPath, 'w342')} alt="" />
        ) : (
          <div className="media-card-cover-empty media-card-cover-fallback">
            <span>{item.title}</span>
          </div>
        )}
      </div>

      <div className="media-card-perforation" />

      <div className="media-card-body">
        <div className="media-card-meta-row">
          <span className="media-card-kind">{item.mediaType === 'tv' ? 'Series' : 'Feature'}</span>
          {item.year && <span className="media-card-year">{item.year}</span>}
        </div>
        <div className="media-card-title-row">
          <h3 className="media-card-title">{item.title}</h3>
          <span className="mobile-status-pill">{mobileStatusSummary(item, isTv)}</span>
          <button
            type="button"
            className="mobile-expand-toggle"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Show less' : 'Show more'}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
        <div className="media-card-detail">
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
            {item.providerIds?.length > 0 ? (
              item.providerIds.map((pid) => (
                <span key={pid} className="provider-stamp">
                  {providerLabel(pid)}
                </span>
              ))
            ) : (
              <span className="media-card-providers-empty">Not streaming</span>
            )}
          </div>
          <span className="media-card-runtime">{formatRuntime(item.runtimeMinutes)}</span>
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
          ) : isTv && inWatchingSection ? (
            <SeasonStatusControl
              seasons={item.seasons}
              onToggleSeason={(seasonIndex) => onToggleSeason(item.id, seasonIndex)}
              onSetStatus={(s) => onSetStatus(item.id, s)}
            />
          ) : isTv && !inWatchingSection ? (
            <TvStatusControl
              status={item.status}
              seasons={item.seasons}
              onSetStatus={(s) => onSetStatus(item.id, s)}
              onToggleSeason={(seasonIndex) => onToggleSeason(item.id, seasonIndex)}
            />
          ) : (
            <StatusStub
              statuses={WATCH_STATUSES}
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
