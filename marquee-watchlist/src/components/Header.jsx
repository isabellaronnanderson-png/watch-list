import { useEffect, useRef, useState } from 'react'
import { searchTitles, getDetails, getWatchProviders, posterUrl } from '../api/tmdb'
import { yearFromDate } from '../utils/format'

export default function Header({ onAdd, existingIds, genreMaps }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | error
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
        const data = await searchTitles(query)
        setResults(data.slice(0, 8))
        setStatus('idle')
      } catch (err) {
        setErrorMsg(err.message)
        setStatus('error')
      }
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  async function handleAdd(result) {
    const mediaType = result.media_type
    const tmdbId = result.id
    const id = `${mediaType}-${tmdbId}`
    setAddingId(id)
    try {
      const [details, providers] = await Promise.all([
        getDetails(mediaType, tmdbId),
        getWatchProviders(mediaType, tmdbId),
      ])
      const title = result.title || result.name
      const dateStr = result.release_date || result.first_air_date
      const genreNames =
        details.genres && details.genres.length
          ? details.genres
          : (result.genre_ids || [])
              .map((gid) => genreMaps?.[mediaType]?.[gid])
              .filter(Boolean)

      onAdd({
        id,
        tmdbId,
        mediaType,
        title,
        year: yearFromDate(dateStr),
        posterPath: result.poster_path,
        runtimeMinutes: details.runtimeMinutes,
        genres: genreNames,
        providers,
      })
      setQuery('')
      setResults([])
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <header className="marquee">
      <p className="marquee-eyebrow">Box office · now booking</p>
      <h1 className="marquee-title">Now Showing</h1>
      <p className="marquee-sub">
        Your watchlist, ticketed. Search a title to print a stub, filter the reel by genre,
        runtime, or where it's streaming.
      </p>

      <div className="box-office">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a film or show…"
          aria-label="Search for a film or TV show to add"
        />
        <span className="box-office-label">Ticket window</span>

        {(status === 'loading' || status === 'error' || results.length > 0) && (
          <div className="results-panel" role="listbox">
            {status === 'loading' && <p className="results-status">Searching…</p>}
            {status === 'error' && <p className="results-error">{errorMsg}</p>}
            {status !== 'loading' &&
              results.map((r) => {
                const id = `${r.media_type}-${r.id}`
                const already = existingIds.has(id)
                const title = r.title || r.name
                const dateStr = r.release_date || r.first_air_date
                return (
                  <div className="result-row" key={id}>
                    {r.poster_path ? (
                      <img src={posterUrl(r.poster_path, 'w92')} alt="" />
                    ) : (
                      <div className="result-row-noimg" style={{ width: 34, height: 51 }} />
                    )}
                    <div className="result-info">
                      <div className="result-title">{title}</div>
                      <div className="result-meta">
                        {r.media_type === 'tv' ? 'Series' : 'Film'}
                        {yearFromDate(dateStr) ? ` · ${yearFromDate(dateStr)}` : ''}
                      </div>
                    </div>
                    <button
                      className="result-add"
                      disabled={already || addingId === id}
                      onClick={() => handleAdd(r)}
                    >
                      {already ? 'Added' : addingId === id ? 'Adding…' : 'Add'}
                    </button>
                  </div>
                )
              })}
            {status === 'idle' && results.length === 0 && query.trim() && (
              <p className="results-status">No matches found.</p>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
