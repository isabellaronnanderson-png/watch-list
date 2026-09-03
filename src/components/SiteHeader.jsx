import BackupPanel from './BackupPanel'
import { useAuthContext } from '../hooks/AuthContext'
import { supabaseEnabled } from '../api/supabaseClient'

export default function SiteHeader() {
  const { user, signOut } = useAuthContext()

  return (
    <div className="site-header">
      <div className="site-header-left">
        <svg className="site-logo" viewBox="0 0 32 32" aria-hidden="true">
          <rect x="2" y="8" width="28" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="2" cy="16" r="3" fill="#fff" stroke="currentColor" strokeWidth="2" />
          <circle cx="30" cy="16" r="3" fill="#fff" stroke="currentColor" strokeWidth="2" />
          <line x1="21" y1="9" x2="21" y2="23" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2,2" />
        </svg>
        <h1 className="site-title">Ultimate Media List</h1>
      </div>
      <div className="site-header-right">
        {supabaseEnabled && user && (
          <button className="backup-toggle" onClick={signOut} title={user.email}>
            Sign out
          </button>
        )}
        <BackupPanel />
      </div>
    </div>
  )
}
