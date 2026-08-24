let listeners = []

export function showRatingPrompt(data) {
  listeners.forEach((fn) => fn(data))
}

export function subscribeRatingPrompt(fn) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter((l) => l !== fn)
  }
}
