import { Link } from 'react-router'
import { BandFlowLogo } from '../components/BandFlowLogo'
import Wristband from '../components/Wristband'
import { useSession } from '../session'

const features = [
  { icon: '≡', title: 'Break work into steps', text: 'Write the job once. BandFlow splits it into ordered subtasks, so nobody has to remember the checklist.' },
  { icon: '⌚', title: 'One step on the band', text: 'The wristband shows only the current step. Tap DONE and the next one arrives over Bluetooth.' },
  { icon: '↗', title: 'Live progress for the boss', text: 'Every finished step updates the dashboard, so the boss sees who is on which step without asking.' },
]

const steps = [
  { title: 'The boss publishes work', text: 'Title, priority, due date and the worker. Add steps or let BandFlow break it down.' },
  { title: 'The band shows step one', text: 'The Raspberry Pi bridge sends the first step to the wristband within seconds.' },
  { title: 'DONE moves it forward', text: 'Each tap marks the step finished, updates progress and sends the next step.' },
]

// Public front page for visitors who are not logged in.
export default function Home() {
  const { isDarkTheme } = useSession()
  return (
    <div className="site">
      <header className="site-nav">
        <Link to="/" aria-label="BandFlow home"><BandFlowLogo height={34} isDarkTheme={isDarkTheme} cropped /></Link>
        <nav aria-label="Site">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
        </nav>
        <div className="site-actions">
          <Link className="btn btn-outline" to="/login">Log in</Link>
          <Link className="btn btn-primary" to="/signup">Get started</Link>
        </div>
      </header>

      <section className="site-hero">
        <div className="site-hero-copy">
          <p className="kicker">Task management on the wrist</p>
          <h1>Every step of the job, right on the worker's wrist.</h1>
          <p className="lead">Bosses plan the work on the web. BandFlow breaks it into steps and sends one step at a time to the wristband. The worker taps DONE and the next step appears.</p>
          <div className="site-cta">
            <Link className="btn btn-primary" to="/signup">Get started</Link>
            <a className="btn btn-outline" href="#how">See how it works</a>
          </div>
          <p className="site-fine">Works with the BandFlow wristband · Phone app and web</p>
        </div>
        <div className="site-hero-visual">
          <Wristband text="Strip the ends" />
          <div className="float-card">
            <strong>Wire the control box</strong>
            <span>Step 2 of 3 on the band</span>
            <div className="progress-row"><div className="progress-track"><div className="progress-fill" style={{ width: '33%' }} /></div><span className="value">33%</span></div>
          </div>
        </div>
      </section>

      <section className="site-section" id="features">
        <div className="site-section-head">
          <h2>Built for crews who work with their hands</h2>
          <p>No phone in the pocket to check. The next step is always on the wrist.</p>
        </div>
        <div className="site-features">
          {features.map((feature) => (
            <div key={feature.title} className="site-feature">
              <span className="site-feature-icon" aria-hidden="true">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-section" id="how">
        <div className="site-section-head"><h2>How it works</h2></div>
        <ol className="site-steps">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="site-step-number">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="site-footer">
        <BandFlowLogo height={24} isDarkTheme={isDarkTheme} cropped />
        <span>© 2026 BandFlow · A NAPROCK project</span>
        <span className="site-footer-links"><Link to="/login">Log in</Link><Link to="/signup">Create account</Link></span>
      </footer>
    </div>
  )
}
