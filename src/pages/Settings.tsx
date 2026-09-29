import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { changePassword, checkServer, getApiUrl } from '../api'
import { PageHeader, Spinner } from '../components/ui'
import { errorText } from '../format'
import { useSession } from '../session'

type ConnectionState = 'idle' | 'checking' | 'ok' | 'failed'

export default function Settings() {
  const { isDarkTheme, setDarkTheme, signOut } = useSession()
  const navigate = useNavigate()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; isError: boolean } | null>(null)
  const [connection, setConnection] = useState<ConnectionState>('idle')

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault()
    if (newPassword.length < 6) {
      setPasswordMessage({ text: 'New password must be at least 6 characters.', isError: true })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'New passwords do not match.', isError: true })
      return
    }
    setIsChangingPassword(true)
    setPasswordMessage(null)
    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
      setPasswordMessage({ text: 'Password changed.', isError: false })
    } catch (error) {
      setPasswordMessage({ text: errorText(error, 'Unable to change password.'), isError: true })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const testConnection = async () => {
    setConnection('checking')
    try {
      await checkServer()
      setConnection('ok')
    } catch {
      setConnection('failed')
    }
  }

  const connectionLabel = { idle: 'Not checked yet', checking: 'Checking…', ok: 'Connected', failed: 'Server unavailable' }[connection]
  const connectionColor = connection === 'ok' ? 'var(--done)' : connection === 'failed' ? 'var(--danger)' : 'var(--body)'

  return (
    <div className="page page-narrow">
      <PageHeader title="Settings" subtitle="Appearance, security, and connection" />

      <p className="section-label">APPEARANCE</p>
      <section className="card form">
        <strong style={{ color: 'var(--title)' }}>Theme</strong>
        <div className="segmented">
          <button type="button" className={isDarkTheme ? 'selected' : ''} onClick={() => setDarkTheme(true)}>🌙&nbsp; Dark</button>
          <button type="button" className={!isDarkTheme ? 'selected' : ''} onClick={() => setDarkTheme(false)}>☀️&nbsp; Light</button>
        </div>
      </section>

      <p className="section-label">SECURITY</p>
      <section className="card form">
        <button
          type="button"
          className="action-card"
          style={{ border: 'none', padding: 0, minHeight: 0, background: 'transparent' }}
          onClick={() => { setShowPasswordForm((current) => !current); setPasswordMessage(null) }}
        >
          <span className="icon" style={{ fontSize: 20 }}>🔒</span>
          <span>
            <strong style={{ fontSize: 14 }}>Change password</strong>
            <small>Use at least 6 characters</small>
          </span>
          <span className="chevron">{showPasswordForm ? '⌃' : '›'}</span>
        </button>
        {showPasswordForm ? (
          <form className="form" onSubmit={(event) => void submitPassword(event)}>
            <input className="input" type="password" autoComplete="current-password" placeholder="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
            <input className="input" type="password" autoComplete="new-password" placeholder="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            <input className="input" type="password" autoComplete="new-password" placeholder="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            <button type="submit" className="btn btn-primary btn-block" disabled={isChangingPassword || !currentPassword || !newPassword}>
              {isChangingPassword ? <Spinner /> : 'Update password'}
            </button>
          </form>
        ) : null}
        {passwordMessage ? <p className={passwordMessage.isError ? 'message-error' : 'message-success'}>{passwordMessage.text}</p> : null}
      </section>

      <p className="section-label">CONNECTION</p>
      <section className="card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20, width: 34, textAlign: 'center' }}>📡</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ color: 'var(--title)', fontSize: 14 }}>BandFlow server</strong>
          <div style={{ fontSize: 12, marginTop: 2, wordBreak: 'break-all' }}>{getApiUrl()}</div>
          <div style={{ fontSize: 12, fontWeight: 800, marginTop: 4, color: connectionColor }}>● {connectionLabel}</div>
        </div>
        <button type="button" className="btn btn-outline btn-small" style={{ borderColor: 'var(--accent)' }} disabled={connection === 'checking'} onClick={() => void testConnection()}>
          {connection === 'checking' ? <Spinner /> : 'Test'}
        </button>
      </section>

      <p className="section-label">ABOUT</p>
      <section className="card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20, width: 34, textAlign: 'center' }}>ℹ️</span>
        <div>
          <strong style={{ color: 'var(--title)', fontSize: 14 }}>BandFlow Web</strong>
          <div style={{ fontSize: 12, marginTop: 2 }}>Version 1.0.0</div>
        </div>
      </section>

      <button
        type="button"
        className="btn btn-danger btn-block"
        style={{ minHeight: 50, marginTop: 8 }}
        onClick={() => {
          signOut()
          navigate('/login', { replace: true })
        }}
      >
        Log out
      </button>
    </div>
  )
}
