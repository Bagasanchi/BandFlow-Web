import { useMemo, useState } from 'react'
import TaskCard from '../components/TaskCard'
import { PageHeader, ProgressBar } from '../components/ui'
import { useSession } from '../session'

const filters = ['All', 'Active', 'Done'] as const

export default function WorkerTasks() {
  const { profile, workItems } = useSession()
  const [filter, setFilter] = useState<(typeof filters)[number]>('Active')

  const filtered = useMemo(() => {
    if (filter === 'Active') return workItems.filter((task) => task.status !== 'Done')
    if (filter === 'Done') return workItems.filter((task) => task.status === 'Done')
    return workItems
  }, [filter, workItems])
  const active = workItems.filter((task) => task.status !== 'Done')
  const averageProgress = active.length ? Math.round(active.reduce((total, task) => total + task.progress, 0) / active.length) : 0

  return (
    <div className="page">
      <PageHeader
        kicker="YOUR WORKSPACE"
        title="Task atlas"
        aside={<span className="chip status-progress" style={{ fontSize: 13 }}>{workItems.length} items</span>}
      />

      <section className="hero">
        <div>
          <p className="kicker" style={{ color: 'var(--body)' }}>CURRENT RHYTHM</p>
          <h2 style={{ fontSize: 22, fontWeight: 900 }}>You are in the flow, {profile?.fullName.split(' ')[0]}.</h2>
          <p style={{ margin: '6px 0 0' }}>Keep the momentum on your active work. Average progress: {averageProgress}%.</p>
        </div>
        <ProgressBar value={averageProgress} />
      </section>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {filters.map((option) => (
          <button key={option} type="button" className={`filter-chip${option === filter ? ' selected' : ''}`} onClick={() => setFilter(option)}>{option}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>{filtered.length} shown</span>
      </div>

      {filtered.length === 0 ? <p className="empty">Nothing here yet.</p> : null}
      <div className="grid-2">
        {filtered.map((task) => <TaskCard key={task.id} task={task} />)}
      </div>
    </div>
  )
}
