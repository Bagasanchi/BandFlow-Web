import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { requestPasswordReset } from '../api'
import { Spinner } from '../components/ui'
import { errorText } from '../format'
import { useSession } from '../session'
import { BandFlowLogo } from '../components/BandFlowLogo'

const steps = [
  'Your boss sees the request in Manage Workers.',
  'They set a temporary password and share it with you.',
  'Log in with it, then choose a new one in Settings.',
]

export default function ForgotPassword() {
  const location = useLocation()
  const { isDarkTheme } = useSession()
  const [email, setEmail] = useState<string>((location.state as { email?: string } | null)?.email ?? '')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sentTo, setSentTo] = useState('')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setErrorMessage('')
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMessage('Enter the email address you log in with.')
      return
    }
    setIsSubmitting(true)
    try {
      await requestPasswordReset(trimmed)
      setSentTo(trimmed)
    } catch (error) {
      setErrorMessage(errorText(error, 'Unable to send the request.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="center-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <BandFlowLogo height={72} isDarkTheme={isDarkTheme} />
        </div>
        <h1>{sentTo ? 'Request sent' : 'Forgot password?'}</h1>
        <p className="subtitle">{sentTo ? 'Your boss will set a temporary password for you.' : "No problem. We'll ask your boss to set a temporary password."}</p>

        <form className="card form" onSubmit={(event) => void onSubmit(event)}>
          {sentTo ? (
            <>
              <span style={{ alignSelf: 'center', width: 56, height: 56, borderRadius: 28, background: 'var(--done-soft)', color: 'var(--done)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900 }}>✓</span>
              <p style={{ margin: 0, textAlign: 'center', fontSize: 14, lineHeight: '20px' }}>
                If <strong style={{ color: 'var(--title)' }}>{sentTo}</strong> belongs to a worker account, the request is waiting for your boss.
              </p>
            </>
          ) : (
            <>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" className="input" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} autoFocus />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting} style={{ minHeight: 52 }}>
                {isSubmitting ? <Spinner /> : 'Send request'}
              </button>
              {errorMessage ? <p className="message-error">{errorMessage}</p> : null}
            </>
          )}

          <p className="section-label" style={{ margin: '8px 0 -2px' }}>WHAT HAPPENS NEXT</p>
          {steps.map((step, index) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 26, height: 26, borderRadius: 13, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{index + 1}</span>
              <span style={{ fontSize: 13, lineHeight: '18px' }}>{step}</span>
            </div>
          ))}

          <p style={{ margin: '4px 0 0', fontSize: 14, textAlign: 'center' }}>
            Remembered it? <Link to="/login" style={{ fontWeight: 800, textDecoration: 'none' }}>Back to log in</Link>
          </p>
        </form>

        <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 8, padding: 14, boxShadow: 'none', borderRadius: 16 }}>
          <span>🔑</span>
          <p style={{ margin: 0, fontSize: 12, lineHeight: '18px' }}>
            <strong style={{ color: 'var(--title)' }}>Boss account? </strong>
            Reset it on the computer running the BandFlow server with <code style={{ color: 'var(--title)' }}>npm run reset-password</code>.
          </p>
        </div>
      </div>
    </div>
  )
}
