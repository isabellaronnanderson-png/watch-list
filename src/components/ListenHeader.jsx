import { useEffect, useRef, useState } from 'react'
import { searchBooks } from '../api/googleBooks'

export default function ListenHeader({ onAdd, existingIds }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [customSubtitle, setCustomSubtitle] = useState('')
  const [customNotes, setCustomNotes] = useState('')

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
        const books = await searchBooks(query)
        setResults(books)
        setStatus('idle')
      } catch (err) {
        setErrorMsg(err.message)
        setStatus('error')
      }
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  function handleAddAudiobook(book) {
    onAdd({
      id: `audio-${book.id}`,
      kind: 'audiobook',
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl,
      year: book.year,
      genres: book.genres,
    })
    // Results list stays open so multiple audiobooks (e.g. a series) can be added in a row.
  }

  function handleAddCustom(e) {
    e.preventDefault()
    if (!customTitle.trim()) return
    onAdd({
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: 'custom',
      title: customTitle.trim(),
      subtitle: customSubtitle.trim(),
      notes: customNotes.trim(),
    })
    setCustomTitle('')
    setCustomSubtitle('')
    setCustomNotes('')
    setShowCustomForm(false)
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
          placeholder="Search for an audiobook…"
          aria-label="Search for an audiobook to add"
        />
        <span className="search-bar-label">Search</span>

        {showResults && (status === 'loading' || status === 'error' || results.length > 0) && (
          <div className="results-panel" role="listbox">
            {status === 'loading' && <p className="results-status">Searching…</p>}
            {status === 'error' && <p className="results-error">{errorMsg}</p>}
            {status !== 'loading' &&
              results.map((book) => {
                const id = `audio-${book.id}`
                const already = existingIds.has(id)
                return (
                  <div
                    className={`result-row${already ? ' is-disabled' : ''}`}
                    key={id}
                    role="button"
                    tabIndex={already ? -1 : 0}
                    onClick={() => !already && handleAddAudiobook(book)}
                    onKeyDown={(e) => {
                      if (!already && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        handleAddAudiobook(book)
                      }
                    }}
                  >
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt="" />
                    ) : (
                      <div style={{ width: 34, height: 51, background: 'var(--surface-alt)' }} />
                    )}
                    <div className="result-info">
                      <div className="result-title">{book.title}</div>
                      <div className="result-meta">{book.author}</div>
                    </div>
                    <span className="result-add">{already ? 'Added' : 'Add'}</span>
                  </div>
                )
              })}
            {status === 'idle' && results.length === 0 && query.trim() && (
              <p className="results-status">No matches found.</p>
            )}
          </div>
        )}
      </div>

      <button className="custom-add-toggle" onClick={() => setShowCustomForm((v) => !v)}>
        {showCustomForm ? '× Cancel' : '+ Add manually'}
      </button>

      {showCustomForm && (
        <form className="custom-add-form" onSubmit={handleAddCustom}>
          <input
            type="text"
            placeholder="Title"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Show / episode / artist (optional)"
            value={customSubtitle}
            onChange={(e) => setCustomSubtitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Notes (optional)"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
          />
          <button type="submit" className="result-add" style={{ alignSelf: 'flex-start' }}>
            Add to queue
          </button>
        </form>
      )}
    </div>
  )
}
