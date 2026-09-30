import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import Avatar from './Avatar'
import { BandFlowLogo } from './BandFlowLogo'
import { useSession } from '../session'

type MenuItem = { icon: string; title: string; detail: string; to: string }

const bossItems: MenuItem[] = [
  { icon: '🏠', title: 'Dashboard', detail: 'Overview and team work', to: '/' },
  { icon: '✏️', title: 'Create Work', detail: 'Define new tasks or projects', to: '/work/new' },
  { icon: '🤖', title: 'Assign Work', detail: 'Pick the right owner', to: '/work/assign' },
  { icon: '📈', title: 'Work Progress', detail: 'Team progress at a glance', to: '/progress' },
  { icon: '👥', title: 'Manage Workers', detail: 'Worker info and availability', to: '/workers' },
]

const workerItems: MenuItem[] = [
  { icon: '🏠', title: 'Dashboard', detail: 'Your active work', to: '/' },
  { icon: '📋', title: 'All Tasks', detail: 'Everything assigned to you', to: '/tasks' },
]

const accountItems: MenuItem[] = [
  { icon: '👤', title: 'Profile', detail: 'Photo, name, and contact info', to: '/profile' },
  { icon: '⚙️', title: 'Settings', detail: 'Appearance, password, and connection', to: '/settings' },
]

// Signed-in frame: top bar with the ☰ side menu (top left) and the user's avatar (top right).
export default function Layout() {
  const { profile, signOut, notice, dismissNotice, isDarkTheme } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isMenuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setIsMenuOpen(false)
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isMenuOpen])

  if (!profile) return null
  const roleItems = profile.role === 'boss' ? bossItems : workerItems

  const renderItem = (item: MenuItem) => (
    <Link key={item.to} to={item.to} onClick={() => setIsMenuOpen(false)} className="action-card" style={{ minHeight: 64, textDecoration: 'none' }} aria-current={location.pathname === item.to ? 'page' : undefined}>
      <span className="icon" style={{ fontSize: 20 }}>{item.icon}</span>
      <span>
        <strong style={{ fontSize: 14 }}>{item.title}</strong>
        <small style={{ fontSize: 11 }}>{item.detail}</small>
      </span>
      <span className="chevron">›</span>
    </Link>
  )

  return (
    <>
      <div className="topbar">
        <button type="button" className="menu-button" aria-label="Open menu" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(true)}>
          <span /><span /><span />
        </button>
        <Link to="/" className="brand" aria-label="BandFlow home"><BandFlowLogo height={30} isDarkTheme={isDarkTheme} cropped /></Link>
        <div className="topbar-spacer" />
        <button type="button" className="topbar-user" onClick={() => navigate('/profile')} aria-label="Open profile">
          <span className="topbar-name">{profile.fullName}</span>
          <Avatar name={profile.fullName} src={profile.avatar} size={36} />
        </button>
      </div>

      {isMenuOpen ? (
        <>
          <div className="backdrop" onClick={() => setIsMenuOpen(false)} />
          <nav className="drawer" aria-label="Main menu">
            <div className="drawer-profile">
              <Avatar name={profile.fullName} src={profile.avatar} size={56} />
              <div className="drawer-profile-copy">
                <strong>{profile.fullName}</strong>
                <small>{profile.email}</small>
                <span className="chip chip-accent" style={{ marginTop: 7 }}>{profile.jobTitle || (profile.role === 'boss' ? 'Boss' : 'Worker')}</span>
              </div>
            </div>
            <div className="drawer-nav">
              {roleItems.map(renderItem)}
              <p className="drawer-nav-heading">ACCOUNT</p>
              {accountItems.map(renderItem)}
            </div>
            <button
              type="button"
              className="btn btn-danger btn-block drawer-logout"
              onClick={() => {
                signOut()
                navigate('/login', { replace: true })
              }}
            >
              Log out
            </button>
          </nav>
        </>
      ) : null}

      <main>
        <Outlet />
      </main>

      {notice ? (
        <div className={`toast toast-${notice.tone}`} role="status">
          <span className="toast-icon">{notice.tone === 'success' ? '⌚' : '⚠️'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong>{notice.title}</strong>
            <p>{notice.text}</p>
          </div>
          <button type="button" className="icon-button" aria-label="Dismiss" onClick={dismissNotice}>×</button>
        </div>
      ) : null}
    </>
  )
}
