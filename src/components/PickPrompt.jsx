import { clearPick } from '../utils/pickStore'
import { scrollToItem } from '../utils/scrollToItem'

export default function PickPrompt({ item, startStatus, startLabel, onSetStatus }) {
  const alreadyStarted = item.status === startStatus

  function start() {
    onSetStatus(item.id, startStatus)
    clearPick()
    // The card moves to the "Currently ..." section, so follow it there.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToItem(item.id))
    })
  }

  return (
    <div className="pick-prompt" role="status">
      <span className="pick-prompt-label">Your pick</span>
      {alreadyStarted && <p className="pick-prompt-note">Already in progress</p>}
      <div className="pick-prompt-actions">
        {!alreadyStarted && (
          <button type="button" className="pick-prompt-start" onClick={start}>
            {startLabel}
          </button>
        )}
        <button type="button" className="pick-prompt-dismiss" onClick={clearPick}>
          Dismiss
        </button>
      </div>
    </div>
  )
}
