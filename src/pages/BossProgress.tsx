import { useNavigate } from 'react-router'
import Avatar from '../components/Avatar'
import { PageHeader, ProgressBar, StatusChip } from '../components/ui'
import { useSession } from '../session'

export default function BossProgress() {
  const { profile, workItems } = useSession()
  const navigate = useNavigate()
  const completedCount = workItems.filter((item) => item.status === 'Done').length
  const reviewCount = workItems.filter((item) => item.status === 'Review').length
  const progressCount = workItems.filter((item) => item.status === 'In Progress').length
  const averageProgress = workItems.length ? Math.round(workItems.reduce((total, item) => total + item.progress, 0) / workItems.length) : 0
  const largest = Math.max(1, progressCount, reviewCount, completedCount)
  const bars = [
    { label: 'In Progress', value: progressCount, color: 'var(--accent)' },
    { label: 'Review', value: reviewCount, color: 'var(--review)' },
    { label: 'Done', value: completedCount, color: 'var(--done)' },
  ]
  const firstName = profile?.fullName.split(' ')[0] ?? 'team'

  return (
    <div className="page">
      <PageHeader kicker="COMMAND CENTER" title="Work progress" aside={<span className="chip status-done">● Live</span>} />

      <section className="hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <p className="kicker" style={{ color: 'var(--body)' }}>TEAM PULSE</p>
            <h2 style={{ fontSize: 24, fontWeight: 900 }}>{workItems.length ? `Your team is ${averageProgress}% of the way there, ${firstName}.` : `No work assigned yet, ${firstName}.`}</h2>
            <p style={{ margin: '6px 0 0' }}>{completedCount} of {workItems.length} tasks are done.</p>
          </div>
          <div style={{ width: 86, height: 86, borderRadius: 43, border: '4px solid var(--accent)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <strong style={{ color: 'var(--title)', fontSize: 24 }}>{averageProgress}</strong>
            <small style={{ fontSize: 11 }}>avg %</small>
          </div>
        </div>
        <ProgressBar value={averageProgress} />
      </section>

      <div className="grid-3">
        <div className="card stat"><span className="value">{workItems.length}</span><span className="label">total tasks</span></div>
        <div className="card stat"><span className="value">{averageProgress}%</span><span className="label">average progress</span></div>
        <div className="card stat"><span className="value" style={{ color: 'var(--done)' }}>{completedCount}</span><span className="label">shipped</span></div>
      </div>

      <div className="grid-2">
        <section className="card">
          <h2 className="card-title">Work by status</h2>
          <p className="card-subtitle">How the team's tasks are split right now</p>
          <div className="bar-chart">
            {bars.map((bar) => (
              <div key={bar.label} className="bar-column">
                <strong style={{ color: 'var(--title)' }}>{bar.value}</strong>
                <div className="bar-track"><div className="bar" style={{ height: `${(bar.value / largest) * 100}%`, background: bar.color }} /></div>
                <span className="bar-label">{bar.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ paddingBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 className="card-title">Team pulse</h2>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{progressCount + reviewCount} active</span>
          </div>
          {workItems.length === 0 ? <p className="empty">No assigned work yet.</p> : null}
          {workItems.map((item) => (
            <div key={item.id} className="list-row clickable" style={{ borderRadius: 12, paddingInline: 6 }} onClick={() => navigate(`/tasks/${item.id}`)}>
              <Avatar name={item.assignedTo} size={36} />
              <div className="copy">
                <strong>{item.assignedTo}</strong>
                <small>{item.title}</small>
                <div style={{ marginTop: 6 }}><ProgressBar value={item.progress} /></div>
              </div>
              <StatusChip status={item.status} />
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
