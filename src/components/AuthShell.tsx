import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { BandFlowLogo } from './BandFlowLogo'
import Wristband from './Wristband'
import { useSession } from '../session'

// Split layout for Log in, Create account and Forgot password: brand panel left, form right.
// On phones the panel shrinks to a header above the form.
export default function AuthShell({ children }: { children: ReactNode }) {
  const { isDarkTheme } = useSession()
  return (
    <div className="auth-split">
      <aside className="auth-panel">
        <Link to="/" aria-label="BandFlow home" className="auth-panel-logo"><BandFlowLogo height={40} isDarkTheme={isDarkTheme} cropped /></Link>
        <div className="auth-panel-copy">
          <h2>Your team's work, one step at a time.</h2>
          <p>Log in to plan work, follow progress and see what is on the wristband right now.</p>
        </div>
        <div className="auth-panel-band"><Wristband text="Connect the terminals" /></div>
      </aside>
      <main className="auth-main">{children}</main>
    </div>
  )
}
