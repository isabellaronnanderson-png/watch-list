import TicketCard from './TicketCard'

export function EmptyState({ hasAnyItems }) {
  return (
    <div className="empty-state">
      <h2>{hasAnyItems ? 'No titles match' : 'Nothing here yet'}</h2>
      <p>
        {hasAnyItems
          ? 'Try clearing a filter — nothing in your watchlist fits this combination yet.'
          : 'Search above to add your first title.'}
      </p>
    </div>
  )
}

export default function TicketGrid({ items, onSetStatus, onToggleSeason, onRemove, inWatchingSection }) {
  return (
    <div className="media-grid-h">
      {items.map((item) => (
        <TicketCard
          key={item.id}
          item={item}
          onSetStatus={onSetStatus}
          onToggleSeason={onToggleSeason}
          onRemove={onRemove}
          inWatchingSection={inWatchingSection}
        />
      ))}
    </div>
  )
}
