// Creates a setRating action bound to a given setItems updater. Used by every
// tab's list hook so the rating logic isn't duplicated six times.
export function makeRatingActions(setItems) {
  function setRating(id, rating) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, rating } : p)))
  }
  return { setRating }
}
