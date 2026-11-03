import { useMemo, useState } from 'react'
import { useWatchlist } from '../hooks/useWatchlist'
import { useReadlist } from '../hooks/useReadlist'
import { useListenlist } from '../hooks/useListenlist'
import { useAlbums } from '../hooks/useAlbums'
import { useGameslist } from '../hooks/useGameslist'
import { posterUrl } from '../api/tmdb'
import { coverUrl as openLibraryCoverUrl } from '../api/openLibrary'

const KINDS = [
  { id: 'watch', label: 'Watch', accent: '31, 63, 191' },
  { id: 'read', label: 'Read', accent: '242, 196, 0' },
  { id: 'listen', label: 'Listen', accent: '78, 195, 224' },
  { id: 'albums', label: 'Albums', accent: '232, 132, 45' },
  { id: 'games', label: 'Play', accent: '139, 47, 201' },
]
const KIND_BY_ID = Object.fromEntries(KINDS.map((k) => [k.id, k]))

function describe(kind, item) {
  switch (kind) {
    case 'watch':
      return {
        tag: item.mediaType === 'tv' ? 'TV' : 'Film',
        sub: item.year,
        cover: item.posterPath ? posterUrl(item.posterPath, 'w185') : null,
      }
    case 'read':
      return {
        tag: 'Book',
        sub: item.author,
        cover: item.coverUrl || (item.coverId ? openLibraryCoverUrl(item.coverId, 'M') : null),
      }
    case 'listen':
      return {
        tag: 'Listen',
        sub: item.author || item.subtitle,
        cover: item.coverUrl || (item.coverId ? openLibraryCoverUrl(item.coverId, 'M') : null),
      }
    case 'albums':
      return { tag: 'Album', sub: item.artist, cover: item.coverUrl }
    default:
      return { tag: 'Game', sub: item.year, cover: item.coverUrl }
  }
}

function toInputDate(ts) {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Noon local time, so the day never shifts because of time zones.
function fromInputDate(value) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0).getTime()
}

export default function DiaryTab() {
  const watch = useWatchlist()
  const read = useReadlist()
  const listen = useListenlist()
  const albums = useAlbums()
  const games = useGameslist()
  const [kindFilter, setKindFilter] = useState('all')
  const [editingKey, setEditingKey] = useState(null)

  const setters = {
    watch: watch.setCompletedAt,
    read: read.setCompletedAt,
    listen: listen.setCompletedAt,
    albums: albums.setCompletedAt,
    games: games.setCompletedAt,
  }

  const sources = [
    ['watch', watch.items],
    ['read', read.items],
    ['listen', listen.items],
    ['albums', albums.items],
    ['games', games.items],
  ]

  const months = useMemo(() => {
    const entries = []
    sources.forEach(([kind, items]) => {
      if (kindFilter !== 'all' && kindFilter !== kind) return
      items.forEach((item) => {
        if (typeof item.completedAt === 'number') entries.push({ kind, item })
      })
    })
    entries.sort((a, b) => b.item.completedAt - a.item.completedAt)

    const groups = []
    entries.forEach((entry) => {
      const d = new Date(entry.item.completedAt)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      let group = groups[groups.length - 1]
      if (!group || group.key !== key) {
        group = {
          key,
          label: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
          entries: [],
        }
        groups.push(group)
      }
      group.entries.push(entry)
    })
    return groups
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch.items, read.items, listen.items, albums.items, games.items, kindFilter])

  const total = months.reduce((n, m) => n + m.entries.length, 0)

  return (
    <section className="diary">
      <div className="diary-intro">
        <h2 className="diary-title">Diary</h2>
        <p className="diary-lede">Everything you've finished, month by month.</p>
      </div>

      <div className="diary-filters" role="group" aria-label="Filter diary by type">
        {[{ id: 'all', label: 'All' }, ...KINDS].map((k) => (
          <button
            key={k.id}
            type="button"
            className={`diary-chip${kindFilter === k.id ? ' is-active' : ''}`}
            onClick={() => setKindFilter(k.id)}
          >
            {k.label}
          </button>
        ))}
      </div>

      {total === 0 ? (
        <p className="diary-empty">
          Nothing logged yet. When you mark something as finished it will appear here, dated
          that day.
        </p>
      ) : (
        months.map((month) => (
          <div key={month.key} className="diary-month">
            <h3 className="diary-month-heading">
              <span>{month.label}</span>
              <span className="diary-month-count">{month.entries.length}</span>
            </h3>
            <ul className="diary-list">
              {month.entries.map(({ kind, item }) => {
                const entryKey = `${kind}:${item.id}`
                const info = describe(kind, item)
                const accent = KIND_BY_ID[kind].accent
                const d = new Date(item.completedAt)
                return (
                  <li
                    key={entryKey}
                    className="diary-entry"
                    style={{ '--entry-accent-rgb': accent }}
                  >
                    <div className="diary-date">
                      {editingKey === entryKey ? (
                        <input
                          type="date"
                          className="diary-date-input"
                          autoFocus
                          max={toInputDate(Date.now())}
                          defaultValue={toInputDate(item.completedAt)}
                          onChange={(e) => {
                            if (e.target.value) {
                              setters[kind](item.id, fromInputDate(e.target.value))
                              setEditingKey(null)
                            }
                          }}
                          onBlur={() => setEditingKey(null)}
                        />
                      ) : (
                        <button
                          type="button"
                          className="diary-date-btn"
                          onClick={() => setEditingKey(entryKey)}
                          title="Change the date"
                          aria-label={`Finished ${d.toLocaleDateString('en-GB')}. Change the date`}
                        >
                          <span className="diary-day">{d.getDate()}</span>
                          <span className="diary-weekday">
                            {d.toLocaleDateString('en-GB', { weekday: 'short' })}
                          </span>
                        </button>
                      )}
                    </div>
                    <div className="diary-cover">
                      {info.cover ? <img src={info.cover} alt="" loading="lazy" /> : null}
                    </div>
                    <div className="diary-body">
                      <div className="diary-entry-title">{item.title}</div>
                      <div className="diary-entry-sub">
                        <span className="diary-tag">{info.tag}</span>
                        {info.sub ? <span>{info.sub}</span> : null}
                      </div>
                    </div>
                    {item.rating > 0 ? (
                      <div className="diary-stars" aria-label={`${item.rating} out of 5`}>
                        {'★'.repeat(item.rating)}
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        ))
      )}
    </section>
  )
}
