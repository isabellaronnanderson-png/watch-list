import TicketCard from './TicketCard'

export function EmptyState({ hasAnyItems }) {
  return (
    <div className="empty-state">
      <h2>{hasAnyItems ? 'No tickets match the reel' : 'The house is empty'}</h2>
      <p>
        {hasAnyItems
          ? 'Try clearing a filter — nothing in your watchlist fits this combination yet.'
          : 'Search above to print your first ticket and start the reel.'}
      </p>
    </div>
  )
}

export default function TicketGrid({ items, onToggleWatched, onToggleSeason, onRemove }) {
  return (
    <div className="ticket-grid">
      {items.map((item) => (
        <TicketCard
          key={item.id}
          item={item}
          onToggleWatched={onToggleWatched}
          onToggleSeason={onToggleSeason}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
