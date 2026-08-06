import { useState } from 'react'
import { fetchArticleMeta } from '../api/microlink'

export default function ArticlesHeader({ onAdd, existingIds }) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')

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
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  return (
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
  )
}
