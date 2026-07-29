import { GAME_STATUSES, ticketNumber } from '../utils/format'
import StatusStub from './StatusStub'

const LABELS = { want: 'Want', playing: 'Playing', played: 'Played' }
const MODE_LABELS = { singleplayer: 'Singleplayer', multiplayer: 'Multiplayer' }

export default function GameTicket({ item, onSetStatus, onRemove }) {
  return (
    <article className={`media-card${item.status === 'played' ? ' is-done' : ''}`}>
      <button
        className="media-card-remove"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title} from games list`}
        title="Remove"
      >
        ×
      </button>

      <div className="media-card-cover">
        {item.coverUrl ? (
          <img src={item.coverUrl} alt="" />
        ) : (
          <div className="media-card-cover-empty" />
        )}
      </div>

      <div className="media-card-perforation" />

      <div className="media-card-body">
        <div className="media-card-meta-row">
          <span className="media-card-kind">Game</span>
          {item.year && <span className="media-card-year">{item.year}</span>}
        </div>
        <h3 className="media-card-title">{item.title}</h3>
        {item.platforms?.length > 0 && (
          <p className="media-card-sub">{item.platforms.slice(0, 3).join(' · ')}</p>
        )}
        {item.genres?.length > 0 && (
          <p className="media-card-sub">{item.genres.slice(0, 3).join(' · ')}</p>
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
        <div className="media-card-barcode" />
        <span className="media-card-ticket-no">Admit One · No. {ticketNumber(item.id)}</span>
        <StatusStub
          statuses={GAME_STATUSES}
          status={item.status}
          onSetStatus={(s) => onSetStatus(item.id, s)}
          labels={LABELS}
        />
      </div>
    </article>
  )
}
