import { Link, useNavigate } from 'react-router'
import Avatar from '../components/Avatar'
import TaskCard from '../components/TaskCard'
import { useSession } from '../session'

export default function WorkerDashboard() {
  const { profile, workItems } = useSession()
  const navigate = useNavigate()
  if (!profile) return null

  const activeWorkItems = workItems.filter((item) => item.status !== 'Done')
  const stats = [
    { icon: '📋', value: activeWorkItems.length, label: 'Active Tasks' },
    { icon: '✅', value: workItems.length - activeWorkItems.length, label: 'Completed' },
    { icon: '📈', value: `${activeWorkItems.length ? Math.round(activeWorkItems.reduce((total, item) => total + item.progress, 0) / activeWorkItems.length) : 0}%`, label: 'Avg. Progress' },
  ]

  return (
    <div className="page">
      <section className="hero">
        <div className="identity">
          <button type="button" onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', padding: 0 }} aria-label="Open profile">
            <Avatar name={profile.fullName} src={profile.avatar} size={52} />
          </button>
          <div>
            <div className="eyebrow">Worker Dashboard</div>
            <div className="name">{profile.fullName}</div>
          </div>
        </div>
        <div className="grid-3">
          {stats.map((item) => (
            <div key={item.label} className="stat">
              <span className="icon">{item.icon}</span>
              <span className="value">{item.value}</span>
              <span className="label">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 900 }}>Manage Tasks</h2>
        <Link to="/tasks" style={{ fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>View all</Link>
      </div>
      {activeWorkItems.length === 0 ? <p className="empty">{workItems.length === 0 ? 'Your assigned work will appear here.' : 'All assigned work is completed. View all to see completed tasks.'}</p> : null}
      <div className="grid-2">
        {activeWorkItems.map((task) => <TaskCard key={task.id} task={task} />)}
      </div>
    </div>
  )
}
