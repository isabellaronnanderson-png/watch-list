import { useEffect, useRef, useState } from 'react'
import { searchBooks } from '../api/googleBooks'

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

  function handleAdd(book) {
    const id = `book-${book.id}`
    onAdd({
      id,
      title: book.title,
      author: book.author,
      year: book.year,
      coverUrl: book.coverUrl,
      pageCount: book.pageCount,
      genres: book.genres,
    })
    // Results list stays open so multiple books (e.g. a series) can be added in a row.
  }

  return (
    <>

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
              results.map((book) => {
                const id = `book-${book.id}`
                const already = existingIds.has(id)
                return (
                  <div
                    className={`result-row${already ? ' is-disabled' : ''}`}
                    key={id}
                    role="button"
                    tabIndex={already ? -1 : 0}
                    onClick={() => !already && handleAdd(book)}
                    onKeyDown={(e) => {
                      if (!already && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        handleAdd(book)
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
                      <div className="result-meta">
                        {book.author}
                        {book.year ? ` · ${book.year}` : ''}
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
