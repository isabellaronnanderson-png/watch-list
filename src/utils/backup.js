const STORAGE_KEYS = [
  'marquee-watchlist:items',
  'marquee-watchlist:books',
  'marquee-watchlist:listen',
  'marquee-watchlist:games',
  'marquee-watchlist:youtube',
  'marquee-watchlist:articles',
]

export function exportBackup() {
  const data = {}
  STORAGE_KEYS.forEach((key) => {
    const val = localStorage.getItem(key)
    if (val) data[key] = val
  })

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `ultimate-media-list-backup-${date}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Restores a previously exported backup. Overwrites existing data for any tab present in the file. */
export function importBackup(jsonText) {
  const data = JSON.parse(jsonText)
  let restoredCount = 0
  STORAGE_KEYS.forEach((key) => {
    if (data[key]) {
      localStorage.setItem(key, data[key])
      restoredCount++
    }
  })
  if (restoredCount === 0) {
    throw new Error("That file doesn't look like a backup from this app.")
  }
}
