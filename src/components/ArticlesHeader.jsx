import { useState } from 'react'
import { fetchArticleMeta } from '../api/microlink'

export default function ArticlesHeader({ onAdd, existingIds }) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')

  const [showManualForm, setShowManualForm] = useState(false)
  const [manualTitle, setManualTitle] = useState('')
  const [manualUrl, setManualUrl] = useState('')
  const [manualPublisher, setManualPublisher] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return

    const id = `article-${trimmed}`
    if (existingIds.has(id)) {
      setErrorMsg('Already saved.')
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      const meta = await fetchArticleMeta(trimmed)
      onAdd({ id, url: trimmed, ...meta })
      setUrl('')
      setStatus('idle')
    } catch (err) {
      setErrorMsg(`${err.message} You can still add it manually below.`)
      setStatus('error')
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    if (!manualTitle.trim() || !manualUrl.trim()) return
    onAdd({
      id: `article-${manualUrl.trim()}`,
      url: manualUrl.trim(),
      title: manualTitle.trim(),
      publisher: manualPublisher.trim() || null,
      image: null,
      description: null,
    })
    setManualTitle('')
    setManualUrl('')
    setManualPublisher('')
    setShowManualForm(false)
  }

  return (
    <>
      <form className="search-bar" onSubmit={handleSubmit}>
        <div className="search-bar-row">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste an article link…"
            aria-label="Paste an article link to add"
          />
          <button type="submit" className="search-bar-submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Adding…' : 'Add'}
          </button>
        </div>
        {status === 'error' && <p className="results-error">{errorMsg}</p>}
      </form>

      <button className="custom-add-toggle" onClick={() => setShowManualForm((v) => !v)}>
        {showManualForm ? '× Cancel' : "+ Add manually (if a link won't ingest)"}
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
          <input
            type="url"
            placeholder="Link"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Publisher (optional)"
            value={manualPublisher}
            onChange={(e) => setManualPublisher(e.target.value)}
          />
          <button type="submit" className="result-add" style={{ alignSelf: 'flex-start' }}>
            Add to reading list
          </button>
        </form>
      )}
    </>
  )
}
