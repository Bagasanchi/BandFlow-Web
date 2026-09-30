import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { signup } from '../api'
import { Spinner } from '../components/ui'
import { errorText } from '../format'
import { useSession } from '../session'
import { BandFlowLogo } from '../components/BandFlowLogo'

export default function SignUp() {
  const navigate = useNavigate()
  const { isDarkTheme } = useSession()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setErrorMessage('')
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Complete all fields to create your account.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }
    setIsSubmitting(true)
    try {
      await signup(fullName.trim(), email.trim(), password)
      navigate('/login', { replace: true })
    } catch (error) {
      setErrorMessage(errorText(error, 'Unable to create account.'))
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
        <h1>Create your account</h1>
        <p className="subtitle">Start managing your workspace</p>

        <form className="card form" onSubmit={(event) => void onSubmit(event)}>
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" className="input" autoComplete="name" placeholder="Your name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" className="input" type="password" autoComplete="new-password" placeholder="Create a password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" className="input" type="password" autoComplete="new-password" placeholder="Repeat your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting} style={{ minHeight: 52, marginTop: 6 }}>
            {isSubmitting ? <Spinner /> : 'Create account'}
          </button>
          {errorMessage ? <p className="message-error">{errorMessage}</p> : null}
          <p style={{ margin: 0, fontSize: 14, textAlign: 'center' }}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
