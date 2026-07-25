import { useEffect, useRef, useState } from 'react'
import { searchBooks, coverUrl } from '../api/openLibrary'

function audioId(doc) {
  return `audio-${doc.key}`
}

export default function ListenHeader({ onAdd, existingIds }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const debounceRef = useRef(null)

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

  function handleAddAudiobook(doc) {
    onAdd({
      id: audioId(doc),
      kind: 'audiobook',
      workKey: doc.key,
      title: doc.title,
      author: doc.author_name?.[0] || 'Unknown author',
      coverId: doc.cover_i || null,
      year: doc.first_publish_year || null,
    })
    setQuery('')
    setResults([])
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
    <header className="marquee">
      <p className="marquee-eyebrow">Now playing · queue</p>
      <h1 className="marquee-title">Now Playing</h1>
      <p className="marquee-sub">
        Audiobooks and anything else worth queueing up — podcast episodes, single tracks,
        whatever doesn't fit a search box gets added by hand.
      </p>

      <div className="box-office">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an audiobook…"
          aria-label="Search for an audiobook to add"
        />
        <span className="box-office-label">Queue</span>

        {(status === 'loading' || status === 'error' || results.length > 0) && (
          <div className="results-panel" role="listbox">
            {status === 'loading' && <p className="results-status">Searching…</p>}
            {status === 'error' && <p className="results-error">{errorMsg}</p>}
            {status !== 'loading' &&
              results.map((doc) => {
                const id = audioId(doc)
                const already = existingIds.has(id)
                return (
                  <div
                    className={`result-row${already ? ' is-disabled' : ''}`}
                    key={id}
                    role="button"
                    tabIndex={already ? -1 : 0}
                    onClick={() => !already && handleAddAudiobook(doc)}
                    onKeyDown={(e) => {
                      if (!already && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        handleAddAudiobook(doc)
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
                      <div className="result-meta">{doc.author_name?.[0] || 'Unknown author'}</div>
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
        {showCustomForm ? '× Cancel' : '+ Add a podcast episode or something else'}
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
    </header>
  )
}
