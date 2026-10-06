import { useSyncExternalStore } from 'react'

// Which item "Pick for me" most recently chose. Cards read this directly so
// the highlight and prompt live on the card itself, without threading props
// through every tab.
let pickedId = null
const listeners = new Set()

function emit() {
  listeners.forEach((l) => l())
}

export function setPick(id) {
  pickedId = id
  emit()
}

export function clearPick() {
  if (pickedId !== null) {
    pickedId = null
    emit()
  }
}

export function usePickedId() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => pickedId
  )
}
