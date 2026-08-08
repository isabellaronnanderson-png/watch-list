import { useEffect, useRef, useState } from 'react'
import { searchTitles, searchByDirector, getDetails, getWatchProviders, posterUrl } from '../api/tmdb'
import { yearFromDate } from '../utils/format'
import { canonicalizeProvider } from '../utils/providers'

export default function Header({ onAdd, existingIds, genreMaps }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')
  const [addingId, setAddingId] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef(null)
  const containerRef = useRef(null)

  const [showManualForm, setShowManualForm] = useState(false)
  const [manualTitle, setManualTitle] = useState('')
  const [manualType, setManualType] = useState('movie')
  const [manualYear, setManualYear] = useState('')

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
        const [titleResults, directorResults] = await Promise.all([
          searchTitles(query),
          searchByDirector(query).catch(() => []),
        ])
        const merged = [...titleResults]
        directorResults.forEach((r) => {
          if (!merged.some((m) => m.id === r.id && m.media_type === r.media_type)) {
            merged.push(r)
          }
        })
        setResults(merged.slice(0, 20))
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

      const canonicalProviderIds = Array.from(
        new Set(providers.map(canonicalizeProvider).filter(Boolean))
      )

      onAdd({
        id,
        tmdbId,
        mediaType,
        title,
        year: yearFromDate(dateStr),
        posterPath: result.poster_path,
        runtimeMinutes: details.runtimeMinutes,
        genres: genreNames,
        providerIds: canonicalProviderIds,
        numberOfSeasons: mediaType === 'tv' ? details.numberOfSeasons : null,
      })
      // Results list stays open so multiple titles (e.g. a series) can be added in a row.
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    } finally {
      setAddingId(null)
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    if (!manualTitle.trim()) return
    onAdd({
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      mediaType: manualType,
      title: manualTitle.trim(),
      year: manualYear.trim() || null,
      posterPath: null,
      runtimeMinutes: null,
      genres: [],
      providerIds: [],
      numberOfSeasons: null,
    })
    setManualTitle('')
    setManualYear('')
    setShowManualForm(false)
  }

  return (
    <div className="search-section">
      <div className="search-bar" ref={containerRef}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowResults(true)
          }}
          onFocus={() => query.trim() && setShowResults(true)}
          placeholder="Search for a film or show…"
          aria-label="Search for a film or TV show to add"
        />
        <span className="search-bar-label">Search</span>

        {showResults && (status === 'loading' || status === 'error' || results.length > 0) && (
          <div className="results-panel" role="listbox">
            {status === 'loading' && <p className="results-status">Searching…</p>}
            {status === 'error' && <p className="results-error">{errorMsg}</p>}
            {status !== 'loading' &&
              results.map((r) => {
                const id = `${r.media_type}-${r.id}`
                const already = existingIds.has(id)
                const title = r.title || r.name
                const dateStr = r.release_date || r.first_air_date
                const disabled = already || addingId === id
                return (
                  <div
                    className={`result-row${disabled ? ' is-disabled' : ''}`}
                    key={id}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => !disabled && handleAdd(r)}
                    onKeyDown={(e) => {
                      if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        handleAdd(r)
                      }
                    }}
                  >
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

      <button className="custom-add-toggle" onClick={() => setShowManualForm((v) => !v)}>
        {showManualForm ? '× Cancel' : '+ Add manually'}
      </button>

      {showManualForm && (
        <form className="custom-add-form" onSubmit={handleManualSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            required
          />
          <select value={manualType} onChange={(e) => setManualType(e.target.value)}>
            <option value="movie">Film</option>
            <option value="tv">TV Show</option>
          </select>
          <input
            type="text"
            placeholder="Year (optional)"
            value={manualYear}
            onChange={(e) => setManualYear(e.target.value)}
          />
          <button type="submit" className="result-add" style={{ alignSelf: 'flex-start' }}>
            Add to watchlist
          </button>
        </form>
      )}
    </div>
  )
}
