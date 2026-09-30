import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import Avatar from './Avatar'
import { BandFlowLogo } from './BandFlowLogo'
import { useSession } from '../session'

type NavItem = { icon: string; label: string; to: string; count?: number }

const pageNames: Array<[RegExp, string]> = [
  [/^\/$/, 'Dashboard'],
  [/^\/tasks\/.+/, 'Task'],
  [/^\/tasks$/, 'All tasks'],
  [/^\/work\/new$/, 'Create work'],
  [/^\/work\/assign$/, 'Assign work'],
  [/^\/progress$/, 'Progress'],
  [/^\/workers$/, 'Workers'],
  [/^\/profile$/, 'Profile'],
  [/^\/settings$/, 'Settings'],
]

// Signed-in frame: a sidebar that stays open on computers (a drawer on phones) and a top bar
// with the page name, task search and, for bosses, a New work button.
export default function Layout() {
  const { profile, signOut, notice, dismissNotice, isDarkTheme, workItems } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isMenuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setIsMenuOpen(false)
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isMenuOpen])

  if (!profile) return null
  const isBoss = profile.role === 'boss'
  const activeCount = workItems.filter((item) => item.status !== 'Done').length

  const groups: Array<{ title: string; items: NavItem[] }> = isBoss
    ? [
        { title: 'WORK', items: [
          { icon: '◧', label: 'Dashboard', to: '/' },
          { icon: '☰', label: 'All tasks', to: '/tasks', count: activeCount },
          { icon: '＋', label: 'Create work', to: '/work/new' },
          { icon: '✦', label: 'Assign work', to: '/work/assign' },
        ] },
        { title: 'TEAM', items: [
          { icon: '↗', label: 'Progress', to: '/progress' },
          { icon: '◉', label: 'Workers', to: '/workers' },
        ] },
      ]
    : [
        { title: 'WORK', items: [
          { icon: '◧', label: 'Dashboard', to: '/' },
          { icon: '☰', label: 'My tasks', to: '/tasks', count: activeCount },
        ] },
      ]
  groups.push({ title: 'ACCOUNT', items: [
    { icon: '◍', label: 'Profile', to: '/profile' },
    { icon: '⚙', label: 'Settings', to: '/settings' },
  ] })

  const pageName = pageNames.find(([pattern]) => pattern.test(location.pathname))?.[1] ?? 'BandFlow'

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    navigate(search.trim() ? `/tasks?q=${encodeURIComponent(search.trim())}` : '/tasks')
  }

  const logout = () => {
    signOut()
    navigate('/', { replace: true })
  }

  const sidebar = (
    <>
      <Link to="/" className="sidebar-logo" aria-label="BandFlow dashboard" onClick={() => setIsMenuOpen(false)}>
        <BandFlowLogo height={30} isDarkTheme={isDarkTheme} cropped />
      </Link>
      {groups.map((group) => (
        <div key={group.title} className="nav-group">
          <small>{group.title}</small>
          {group.items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className="nav-item" onClick={() => setIsMenuOpen(false)}>
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
              {item.count ? <span className="nav-count">{item.count}</span> : null}
            </NavLink>
          ))}
        </div>
      ))}
      <div className="sidebar-me">
        <Link to="/profile" className="sidebar-me-link" onClick={() => setIsMenuOpen(false)}>
          <Avatar name={profile.fullName} src={profile.avatar} size={34} />
          <span>
            <strong>{profile.fullName}</strong>
            <small>{isBoss ? 'Boss' : 'Worker'}{profile.jobTitle ? ` · ${profile.jobTitle}` : ''}</small>
          </span>
        </Link>
        <button type="button" className="sidebar-logout" onClick={logout}>Log out</button>
      </div>
    </>
  )

  return (
    <div className="workspace">
      <aside className="sidebar" aria-label="Main menu">{sidebar}</aside>

      {isMenuOpen ? (
        <>
          <div className="backdrop" onClick={() => setIsMenuOpen(false)} />
          <nav className="drawer sidebar-drawer" aria-label="Main menu">{sidebar}</nav>
        </>
      ) : null}

      <div className="workspace-main">
        <header className="topbar">
          <button type="button" className="menu-button" aria-label="Open menu" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(true)}>
            <span /><span /><span />
          </button>
          <span className="topbar-title">{pageName}</span>
          <form className="topbar-search" role="search" onSubmit={submitSearch}>
            <span aria-hidden="true">⌕</span>
            <input id="task-search" type="search" placeholder={isBoss ? 'Search tasks and workers' : 'Search my tasks'} value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search tasks" />
          </form>
          {isBoss ? <Link to="/work/new" className="btn btn-primary topbar-new">＋ <span className="topbar-new-label">New work</span></Link> : null}
          <Link to="/profile" className="topbar-avatar" aria-label="Open profile"><Avatar name={profile.fullName} src={profile.avatar} size={34} /></Link>
        </header>
        <main className="workspace-content">
          <Outlet />
        </main>
      </div>

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
    </div>
  )
}
