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
    <header className="marquee">
      <p className="marquee-eyebrow">Reel to reel · queued up</p>
      <h1 className="marquee-title">Watch Later</h1>
      <p className="marquee-sub">
        Paste a link to any long-form video you want to get to eventually — no search, just
        drop it in.
      </p>

      <form className="box-office" onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a YouTube link…"
          aria-label="Paste a YouTube link to add"
        />
        <button type="submit" className="box-office-submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Adding…' : 'Add'}
        </button>
      </form>
      {status === 'error' && <p className="results-error">{errorMsg}</p>}
    </header>
  )
}
