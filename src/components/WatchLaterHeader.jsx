import { useState } from 'react'
import { fetchVideoMeta } from '../api/youtube'

export default function WatchLaterHeader({ onAdd, existingIds }) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!url.trim()) return
    setStatus('loading')
    try {
      const meta = await fetchVideoMeta(url.trim())
      const id = `yt-${meta.videoId}`
      if (existingIds.has(id)) {
        setErrorMsg('Already in your queue.')
        setStatus('error')
        return
      }
      onAdd({ id, ...meta, url: url.trim() })
      setUrl('')
      setStatus('idle')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  return (
    <>

      <form className="search-bar" onSubmit={handleSubmit}>
        <div className="search-bar-row">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a YouTube link…"
            aria-label="Paste a YouTube link to add"
          />
          <button type="submit" className="search-bar-submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Adding…' : 'Add'}
          </button>
        </div>
      </form>
      {status === 'error' && <p className="results-error">{errorMsg}</p>}
    </>
  )
}
