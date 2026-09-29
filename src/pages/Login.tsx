import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSession } from '../session'
import { Spinner } from '../components/ui'
import { errorText } from '../format'

export default function Login() {
  const { signIn } = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const loginInFlight = useRef(false)
  // Set when the password arrives in one go (browser/password-manager autofill or paste)
  // rather than typed, so the form logs in without clicking the button — same as the phone app.
  const passwordWasAutofilled = useRef(false)

  const handleLogin = async () => {
    if (loginInFlight.current) return
    setErrorMessage('')
    setInfoMessage('')
    if (!email.trim() || !password) {
      setErrorMessage('Enter your email and password.')
      return
    }
    loginInFlight.current = true
    setIsSubmitting(true)
    try {
      await signIn(email.trim(), password)
      navigate('/', { replace: true })
    } catch (error) {
      setErrorMessage(errorText(error, 'Unable to sign in.'))
    } finally {
      loginInFlight.current = false
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!passwordWasAutofilled.current || !email.trim() || !password) return
    const timer = setTimeout(() => {
      passwordWasAutofilled.current = false
      void handleLogin()
    }, 400)
    return () => clearTimeout(timer)
    // handleLogin reads the latest email/password from this render.
  }, [email, password])

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void handleLogin()
  }

  return (
    <div className="center-screen">
      <div className="auth-card">
        <div className="brand" style={{ fontSize: 28 }}>
          <img src="/icon.png" alt="" style={{ width: 42, height: 42, borderRadius: 12 }} />
          Workspace Pro
        </div>
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to your workspace</p>

        <form className="card form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => {
                passwordWasAutofilled.current = event.target.value.length - password.length > 1
                setPassword(event.target.value)
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting} style={{ minHeight: 52, marginTop: 6 }}>
            {isSubmitting ? <Spinner /> : 'Log in'}
          </button>
          {errorMessage ? <p className="message-error">{errorMessage}</p> : null}

          <div className="auth-links">
            <Link to="/forgot-password" state={{ email: email.trim() }}>Forgot password?</Link>
            <Link to="/signup">Create account</Link>
          </div>
          {infoMessage ? <p style={{ margin: 0, fontSize: 13 }}>{infoMessage}</p> : null}

          <div className="divider">or continue with</div>
          <button type="button" className="btn btn-outline btn-block" onClick={() => setInfoMessage('Band SSO works from the BandFlow phone app. Use your email and password on the web.')}>
            Band SSO ⌚
          </button>
        </form>

        <p className="footer-note">By continuing, you agree to the Terms and Privacy Policy.</p>
      </div>
    </div>
  )
}
