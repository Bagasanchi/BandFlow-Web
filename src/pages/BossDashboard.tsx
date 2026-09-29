import { useState } from 'react'
import { useNavigate } from 'react-router'
import { deleteWork } from '../api'
import Avatar from '../components/Avatar'
import { StatusChip } from '../components/ui'
import { errorText } from '../format'
import { useSession } from '../session'

export default function BossDashboard() {
  const { profile, workItems, refreshWork } = useSession()
  const navigate = useNavigate()
  const [showCompleted, setShowCompleted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  if (!profile) return null

  const doneCount = workItems.filter((item) => item.status === 'Done').length
  const overview = [
    { icon: '📊', value: workItems.length, label: 'Total Tasks' },
    { icon: '⚙️', value: workItems.filter((item) => item.status === 'In Progress').length, label: 'In Progress' },
    { icon: '🏁', value: doneCount, label: 'Done' },
  ]
  const actions = [
    { icon: '✏️', title: 'Create Work', detail: 'Define new tasks or projects', to: '/work/new' },
    { icon: '📈', title: 'See Work Progress', detail: 'Sprint analytics and team velocity', to: '/progress' },
    { icon: '👥', title: 'Manage Workers', detail: 'View worker info and edit availability', to: '/workers' },
  ]
  const visibleWorkItems = showCompleted ? workItems : workItems.filter((item) => item.status !== 'Done')

  const removeWork = async (id: string, title: string) => {
    if (!window.confirm(`Delete task?\n\nThis will permanently delete "${title}".`)) return
    setErrorMessage('')
    try {
      await deleteWork(id)
      await refreshWork()
    } catch (error) {
      setErrorMessage(errorText(error, 'Unable to delete the task.'))
    }
  }

  return (
    <div className="page">
      <section className="hero" style={{ background: 'var(--accent-soft)' }}>
        <div className="identity">
          <button type="button" onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', padding: 0 }} aria-label="Open profile">
            <Avatar name={profile.fullName} src={profile.avatar} size={52} />
          </button>
          <div>
            <div className="eyebrow">Boss Dashboard</div>
            <div className="name">{profile.fullName}</div>
          </div>
        </div>
        <div className="grid-3">
          {overview.map((item) => (
            <div key={item.label} className="stat">
              <span className="icon">{item.icon}</span>
              <span className="value">{item.value}</span>
              <span className="label">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {actions.map((action) => (
            <button key={action.title} type="button" className="action-card" onClick={() => navigate(action.to)}>
              <span className="icon">{action.icon}</span>
              <span>
                <strong>{action.title}</strong>
                <small>{action.detail}</small>
              </span>
              <span className="chevron">›</span>
            </button>
          ))}
          <button type="button" className="action-card primary" onClick={() => navigate('/work/assign')}>
            <span className="icon">🤖</span>
            <span>
              <strong>Assign Work to Specific Worker</strong>
              <small>AI-powered recommendations</small>
            </span>
            <span className="chevron">›</span>
          </button>
        </div>

        <section className="card" style={{ paddingBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <h2 className="card-title">Team Overview</h2>
              <p className="card-subtitle">{showCompleted ? 'All assigned work' : 'Active work only'}</p>
            </div>
            <button type="button" className={`toggle-chip${showCompleted ? ' selected' : ''}`} onClick={() => setShowCompleted((current) => !current)}>
              {showCompleted ? 'Hide completed' : `Show completed (${doneCount})`}
            </button>
          </div>
          {errorMessage ? <p className="message-error">{errorMessage}</p> : null}
          {visibleWorkItems.length === 0 ? <p className="empty">{workItems.length === 0 ? 'No work has been assigned yet.' : 'All assigned work is completed.'}</p> : null}
          {visibleWorkItems.map((item) => (
            <div key={item.id} className="list-row clickable" onClick={() => navigate(`/tasks/${item.id}`)} style={{ borderRadius: 12, paddingInline: 6 }}>
              <Avatar name={item.assignedTo} size={36} />
              <div className="copy">
                <strong>{item.title}</strong>
                <small>{item.assignedTo}</small>
              </div>
              <StatusChip status={item.status} />
              <button
                type="button"
                className="icon-button"
                aria-label={`Delete ${item.title}`}
                onClick={(event) => {
                  event.stopPropagation()
                  void removeWork(item.id, item.title)
                }}
              >
                ×
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
