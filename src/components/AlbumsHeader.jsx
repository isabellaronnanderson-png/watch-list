import { useEffect, useRef, useState } from 'react'
import { searchAlbums, getAlbumInfo } from '../api/lastfm'

export default function AlbumsHeader({ onAdd, existingIds }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [addingId, setAddingId] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef(null)
  const containerRef = useRef(null)

  const [showManualForm, setShowManualForm] = useState(false)
  const [manualTitle, setManualTitle] = useState('')
  const [manualArtist, setManualArtist] = useState('')

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
        const albums = await searchAlbums(query)
        setResults(albums)
        setStatus('idle')
      } catch (err) {
        setErrorMsg(err.message)
        setStatus('error')
      }
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  async function handleAdd(album) {
    const id = `album-${album.artist}-${album.name}`
    setAddingId(id)
    try {
      const info = await getAlbumInfo(album.artist, album.name)
      onAdd({
        id,
        title: album.name,
        artist: album.artist,
        coverUrl: info.coverUrl || album.coverUrl,
        genres: info.genres,
        trackCount: info.trackCount,
      })
      // Results list stays open so multiple albums can be added in a row.
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
      title: manualTitle.trim(),
      artist: manualArtist.trim() || 'Unknown artist',
      coverUrl: null,
      genres: [],
      trackCount: null,
    })
    setManualTitle('')
    setManualArtist('')
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
          placeholder="Search for an album…"
          aria-label="Search for an album to add"
        />
        <span className="search-bar-label">Search</span>

        {showResults && (status === 'loading' || status === 'error' || results.length > 0) && (
          <div className="results-panel" role="listbox">
            {status === 'loading' && <p className="results-status">Searching…</p>}
            {status === 'error' && <p className="results-error">{errorMsg}</p>}
            {status !== 'loading' &&
              results.map((album) => {
                const id = `album-${album.artist}-${album.name}`
                const already = existingIds.has(id)
                const isAdding = addingId === id

                function handleRowClick() {
                  if (isAdding) return
                  if (already) return
                  handleAdd(album)
                }

                return (
                  <div
                    className={`result-row${isAdding ? ' is-disabled' : ''}${already ? ' is-added' : ''}`}
                    key={id}
                    role="button"
                    tabIndex={isAdding ? -1 : 0}
                    onClick={handleRowClick}
                    onKeyDown={(e) => {
                      if (!isAdding && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        handleRowClick()
                      }
                    }}
                  >
                    {album.coverUrl ? (
                      <img src={album.coverUrl} alt="" />
                    ) : (
                      <div style={{ width: 34, height: 34, background: 'var(--surface-alt)' }} />
                    )}
                    <div className="result-info">
                      <div className="result-title">{album.name}</div>
                      <div className="result-meta">{album.artist}</div>
                    </div>
                    <span className="result-add">
                      {already ? 'Added' : isAdding ? 'Adding…' : 'Add'}
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
            placeholder="Album title"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Artist (optional)"
            value={manualArtist}
            onChange={(e) => setManualArtist(e.target.value)}
          />
          <button type="submit" className="result-add" style={{ alignSelf: 'flex-start' }}>
            Add to shelf
          </button>
        </form>
      )}
    </div>
  )
}
