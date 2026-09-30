import { useState } from 'react'
import { Link } from 'react-router'
import TaskTable from '../components/TaskTable'
import Wristband from '../components/Wristband'
import { useSession } from '../session'

export default function WorkerDashboard() {
  const { profile, workItems } = useSession()
  const [now] = useState(() => new Date())
  if (!profile) return null

  const active = workItems.filter((item) => item.status !== 'Done')
  const averageProgress = active.length ? Math.round(active.reduce((total, item) => total + item.progress, 0) / active.length) : 0
  const onBand = active.flatMap((task) => task.subtasks.filter((subtask) => subtask.status === 'active').map((subtask) => ({ task, subtask })))[0]
  const hour = now.getHours()

  const kpis = [
    { label: 'Active tasks', value: active.length, note: 'Assigned to you' },
    { label: 'Waiting for review', value: workItems.filter((item) => item.status === 'Review').length, note: 'Sent to your boss' },
    { label: 'Finished', value: workItems.length - active.length, note: `of ${workItems.length} in total` },
    { label: 'Average progress', value: `${averageProgress}%`, note: 'Across active work' },
  ]

  return (
    <div className="page page-wide">
      <div className="greet">
        <h1>{hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'}, {profile.fullName.split(' ')[0]}</h1>
        <p>{now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="kpis">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi">
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <small>{kpi.note}</small>
          </div>
        ))}
      </div>

      <div className="dash-cols">
        <section className="panel">
          <header className="panel-head"><h2>Active work</h2><Link to="/tasks" className="panel-link">All my tasks</Link></header>
          <TaskTable tasks={active} showAssignee={false} emptyText={workItems.length ? 'All your work is finished.' : 'Your assigned work will appear here.'} />
        </section>
        <section className="panel">
          <header className="panel-head"><h2>On your wristband</h2></header>
          <div className="watch-panel">
            {onBand ? (
              <>
                <Wristband text={onBand.subtask.description} compact />
                <div className="watch-meta">
                  <Link to={`/tasks/${onBand.task.id}`}>{onBand.task.title}</Link>
                  <span>Step {onBand.subtask.order_index} of {onBand.task.subtasks.length}. Tap DONE on the band when it is finished.</span>
                </div>
              </>
            ) : (
              <p className="empty">Nothing on your wristband right now.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
