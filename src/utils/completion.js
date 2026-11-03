// Powers the Diary. Whenever an item moves into a "done" status we stamp it with
// `completedAt` (a timestamp). Moving it back out of done clears the stamp.
// Items finished before the Diary existed simply have no `completedAt`, so they
// don't appear in it (by design - the diary starts from the day it was added).

export const DONE_STATUSES = new Set(['watched', 'read', 'listened', 'played'])

export function isDone(status) {
  return DONE_STATUSES.has(status)
}

// Given the item before and after a change, returns the "after" item with
// `completedAt` set, kept or removed as appropriate.
export function stampCompletion(before, after) {
  const wasDone = isDone(before.status)
  const nowDone = isDone(after.status)
  if (nowDone && !wasDone) return { ...after, completedAt: Date.now() }
  if (!nowDone && 'completedAt' in after) {
    const { completedAt, ...rest } = after
    return rest
  }
  return after
}
