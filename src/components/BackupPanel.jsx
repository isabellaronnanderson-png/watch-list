import { useEffect, useRef, useState } from 'react'
import { exportBackup, importBackup } from '../utils/backup'

export default function BackupPanel() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importBackup(reader.result)
        setMessage('Restored! Reloading…')
        setTimeout(() => window.location.reload(), 900)
      } catch (err) {
        setMessage(err.message)
      }
    }
    reader.onerror = () => setMessage('Could not read that file.')
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="backup-panel-wrap" ref={wrapRef}>
      <button className="backup-toggle" onClick={() => setOpen((v) => !v)}>
        Backup
      </button>
      {open && (
        <div className="backup-panel">
          <button
            className="backup-action"
            onClick={() => {
              exportBackup()
              setMessage('Backup downloaded.')
            }}
          >
            Download backup
          </button>
          <button className="backup-action backup-action-outline" onClick={() => fileInputRef.current?.click()}>
            Restore from file
          </button>
          <input
            type="file"
            accept="application/json"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFile}
          />
          {message && <p className="backup-message">{message}</p>}
          <p className="backup-hint">
            Restoring replaces whatever's currently in your lists on this device. Worth doing a
            fresh download every so often, and definitely before clearing your browser's cache
            or site data.
          </p>
        </div>
      )}
    </div>
  )
}
