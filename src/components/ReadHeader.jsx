import { useEffect, useRef, useState } from 'react'
import { searchBooks, coverUrl } from '../api/openLibrary'
import HeroBanner from './HeroBanner'

function workId(doc) {
  return `book-${doc.key}`
}

export default function ReadHeader({ onAdd, existingIds }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
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
        const docs = await searchBooks(query)
        setResults(docs.slice(0, 8))
        setStatus('idle')
      } catch (err) {
        setErrorMsg(err.message)
        setStatus('error')
      }
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  function handleAdd(doc) {
    const id = workId(doc)
    onAdd({
      id,
      workKey: doc.key,
      title: doc.title,
      author: doc.author_name?.[0] || 'Unknown author',
      year: doc.first_publish_year || null,
      coverId: doc.cover_i || null,
      pageCount: doc.number_of_pages_median || null,
      genres: (doc.subject || []).slice(0, 3),
    })
    setQuery('')
    setResults([])
  }

  return (
    <>
      <HeroBanner title="Read" />

      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a book or author…"
          aria-label="Search for a book to add"
        />
        <span className="search-bar-label">Search</span>

        {(status === 'loading' || status === 'error' || results.length > 0) && (
          <div className="results-panel" role="listbox">
            {status === 'loading' && <p className="results-status">Searching…</p>}
            {status === 'error' && <p className="results-error">{errorMsg}</p>}
            {status !== 'loading' &&
              results.map((doc) => {
                const id = workId(doc)
                const already = existingIds.has(id)
                return (
                  <div
                    className={`result-row${already ? ' is-disabled' : ''}`}
                    key={id}
                    role="button"
                    tabIndex={already ? -1 : 0}
                    onClick={() => !already && handleAdd(doc)}
                    onKeyDown={(e) => {
                      if (!already && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        handleAdd(doc)
                      }
                    }}
                  >
                    {doc.cover_i ? (
                      <img src={coverUrl(doc.cover_i, 'S')} alt="" />
                    ) : (
                      <div style={{ width: 34, height: 51, background: 'var(--paper-shadow)' }} />
                    )}
                    <div className="result-info">
                      <div className="result-title">{doc.title}</div>
                      <div className="result-meta">
                        {doc.author_name?.[0] || 'Unknown author'}
                        {doc.first_publish_year ? ` · ${doc.first_publish_year}` : ''}
                      </div>
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
    </>
  )
}
