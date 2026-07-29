import { useEffect, useRef, useState } from 'react'
import { searchGames, getGameDetails } from '../api/rawg'
import { yearFromDate } from '../utils/format'
import HeroBanner from './HeroBanner'

export default function GamesHeader({ onAdd, existingIds }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [addingId, setAddingId] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setStatus('idle')
      return
    }
    setStatus('loading')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const games = await searchGames(query)
        setResults(games)
        setStatus('idle')
      } catch (err) {
        setErrorMsg(err.message)
        setStatus('error')
      }
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  async function handleAdd(game) {
    const id = `game-${game.id}`
    setAddingId(id)
    try {
      const details = await getGameDetails(game.id)
      onAdd({
        id,
        title: game.name,
        year: yearFromDate(game.released),
        coverUrl: game.background_image || null,
        genres: details.genres,
        platforms: details.platforms,
        playtimeHours: details.playtimeHours,
        modes: details.modes,
      })
      // Results list stays open so multiple games can be added in a row.
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <>
      <HeroBanner title="Games" />

      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a video game…"
          aria-label="Search for a video game to add"
        />
        <span className="search-bar-label">Search</span>

        {(status === 'loading' || status === 'error' || results.length > 0) && (
          <div className="results-panel" role="listbox">
            {status === 'loading' && <p className="results-status">Searching…</p>}
            {status === 'error' && <p className="results-error">{errorMsg}</p>}
            {status !== 'loading' &&
              results.map((game) => {
                const id = `game-${game.id}`
                const already = existingIds.has(id)
                const disabled = already || addingId === id
                return (
                  <div
                    className={`result-row${disabled ? ' is-disabled' : ''}`}
                    key={id}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => !disabled && handleAdd(game)}
                    onKeyDown={(e) => {
                      if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        handleAdd(game)
                      }
                    }}
                  >
                    {game.background_image ? (
                      <img src={game.background_image} alt="" style={{ height: 51, width: 68, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 68, height: 51, background: 'var(--surface-alt)' }} />
                    )}
                    <div className="result-info">
                      <div className="result-title">{game.name}</div>
                      <div className="result-meta">
                        {yearFromDate(game.released) || 'Unreleased'}
                      </div>
                    </div>
                    <span className="result-add">
                      {already ? 'Added' : addingId === id ? 'Adding…' : 'Add'}
                    </span>
                  </div>
                )
              })}
            {status === 'idle' && results.length === 0 && query.trim() && (
              <p className="results-status">No matches found.</p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
