import { useState } from 'react'
import { useAuthContext } from '../hooks/AuthContext'
import { supabaseEnabled } from '../api/supabaseClient'

export default function AuthGate({ children }) {
  const { user, loading, signIn, signUp } = useAuthContext()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [signupComplete, setSignupComplete] = useState(false)

  if (!supabaseEnabled) return children
  if (loading) return <div className="auth-screen" />
  if (user) return children

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) return
    setSubmitting(true)
    const action = mode === 'signup' ? signUp : signIn
    const { error: err } = await action(email.trim(), password)
    setSubmitting(false)
    if (err) {
      setError(err.message)
    } else if (mode === 'signup') {
      setSignupComplete(true)
    }
  }

  function backToSignIn() {
    setSignupComplete(false)
    setMode('signin')
    setPassword('')
    setError('')
  }

  if (signupComplete) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-sub">
            Your account was created. We've sent a confirmation link to <strong>{email}</strong> —
            click it, then come back here and sign in.
          </p>
          <button type="button" className="auth-submit" onClick={backToSignIn}>
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">Ultimate Media List</h1>
        <p className="auth-sub">
          {mode === 'signup'
            ? 'Create an account so your lists survive a cleared cache or a new device.'
            : 'Sign in to sync your lists.'}
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            minLength={6}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setMode(mode === 'signup' ? 'signin' : 'signup')
            setError('')
          }}
        >
          {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}
